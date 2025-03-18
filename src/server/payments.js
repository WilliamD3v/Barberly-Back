require("dotenv").config();
import Stripe from "stripe";

import { databaseConnection } from "../utils/database";
import barbeariaSchema from "../models/user";
import Payment from "../models/payments";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const getStripeCustomerByEmail = async (email) => {
  const customers = await stripe.customers.list({ email });
  console.log("Existente:", customers);
  return customers.data[0];
};

export const createSubscription = async (barbeariaId, userEmail, planId) => {
  const customer = await getStripeCustomerByEmail(userEmail);

  if (customer) return customer;

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "subscription",
    client_reference_id: barbeariaId,
    customer_email: userEmail,
    metadata: { idUser: barbeariaId },
    line_items: [
      {
        price: planId,
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard/${barbeariaId}`,
    cancel_url: `${process.env.FRONTEND_URL}/cancel`,
  });
  return session;
};

export const handleCheckoutSessionCompleted = async (event) => {
  const idUser = event.data.object.client_reference_id;
  const emailUser = event.data.object.customer_email;
  const stripeSubscriptionId = event.data.object.subscription;
  const stripeCustomerId = event.data.object.customer;
  const checkoutStatus = event.data.object.status;

  /*   console.log("Testando evento:", event); */

  if (checkoutStatus !== "complete") return;

  /*   console.log("parei nas validacao"); */

  if (!idUser || !emailUser || !stripeSubscriptionId || !stripeCustomerId) {
    throw new Error(
      "idUser, stripeSubscriptionId, stripeCustomerId is required"
    );
  }

  console.log(idUser, "teste");

  const userExist = await barbeariaSchema.findById(idUser);

  if (!userExist) {
    throw new Error("Usuarios nao encontrado");
  }

  console.log("cheguei no BD");

  const newPayment = new Payment({
    client_reference_id: idUser,
    userEmail: emailUser,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: stripeSubscriptionId,
  });

  await newPayment.save();
};

export const handleSubscriptionSessionCompleted = async (event) => {
  try {
    const stripeCustomerId = event.data.object.customer;
    const checkoutStatus = event.data.object.status;
    const stripePlan = event.data.object.plan.id;

    if (!stripeCustomerId || !checkoutStatus) {
      throw new Error("stripeCustomerId ou checkoutStatus não encontrados");
    }

    // Buscar a última sessão do cliente
    const sessions = await stripe.checkout.sessions.list({
      customer: stripeCustomerId,
      limit: 1,
    });

    if (!sessions.data.length) {
      console.error("Nenhuma sessão encontrada para este cliente!");
      return;
    }

    const session = sessions.data[0];

    // Verificar se a sessão possui metadados
    if (!session.metadata || !session.metadata.idUser) {
      console.error("idUser não encontrado nos metadados da sessão");
      return;
    }

    const idUser = session.metadata.idUser;

    const userExist = await barbeariaSchema.findById(idUser);

    if (!userExist) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    const planMapping = {
      price_1QrPHgFuK8IcbVKxomNX4I9A: "Basico",
      price_1QslNVFuK8IcbVKxwmx1mCCx: "Pro",
    };

    const planName = planMapping[stripePlan] || "Desconhecido";

    // Atualizar status do usuário
    await barbeariaSchema.findByIdAndUpdate(idUser, {
      status_conta: checkoutStatus,
      plano_assinado: planName,
    });
  } catch (error) {
    console.error("Erro no handleSubscriptionSessionCompleted:", error);
  }
};

export const handlePlanUpdate = async (subscriptionId, newPriceId) => {
  try {
    // Recupera a assinatura atual
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const currentPriceId = subscription.items.data[0].price.id;

    if (currentPriceId === newPriceId) {
      throw new Error("O novo plano deve ser diferente do atual.");
    }

    let prorationBehavior = "create_prorations";
    let updateParams = {
      items: [{ id: subscription.items.data[0].id, price: newPriceId }],
    };

    const currentPrice = await stripe.prices.retrieve(currentPriceId);
    const newPrice = await stripe.prices.retrieve(newPriceId);

    if (newPrice.unit_amount > currentPrice.unit_amount) {
      // Upgrade: cobrar diferença imediatamente e reiniciar ciclo
      updateParams.proration_behavior = "create_prorations";
    } else {
      // Downgrade: agendar mudança para o próximo ciclo
      updateParams.proration_behavior = "none";
      updateParams.cancel_at_period_end = true;

      // Calcula tempo restante até o fim do ciclo atual
      const currentPeriodEnd = new Date(subscription.current_period_end * 1000);
      const now = new Date();
      const timeRemaining = Math.ceil(
        (currentPeriodEnd - now) / (1000 * 60 * 60 * 24)
      );
      console.log(
        `O plano atual será mantido por mais ${timeRemaining} dias até a mudança para o novo plano.`
      );
    }

    const updatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      updateParams
    );
    return updatedSubscription;
  } catch (error) {
    console.error("Erro ao atualizar o plano:", error);
    throw new Error("Não foi possível atualizar o plano.");
  }
};

export const handleCancelPlan = async (event) => {
  try {
    const stripeCustomerId = event.data.object.customer;
    const checkoutStatus = event.data.object.status;

    console.log(stripeCustomerId, "teste", checkoutStatus);

    const sessions = await stripe.checkout.sessions.list({
      customer: stripeCustomerId,
      limit: 1,
    });

    if (!sessions.data.length) {
      console.error("Nenhuma sessão encontrada para este cliente!");
      return;
    }

    const session = sessions.data[0];

    // Verificar se a sessão possui metadados
    if (!session.metadata || !session.metadata.idUser) {
      console.error("idUser não encontrado nos metadados da sessão");
      return;
    }

    const idUser = session.metadata.idUser;

    console.log("ID:", idUser);

    const userExist = await barbeariaSchema.findById(idUser);

    console.log("dados de usuario:", userExist);

    if (!userExist) {
      throw new Error("Usuário não encontrado no banco de dados");
    }

    await barbeariaSchema.findByIdAndUpdate(idUser, {
      status_conta: checkoutStatus,
      plano_assinado: "",
    });

    await stripe.customers.del(stripeCustomerId);
    console.log("Cliente removido do Stripe!!!!!!!");
  } catch (error) {}
};

export const cancelSubscriptionAndDeleteUser = async (
  paymentId,
  subscriptionId,
  customerId,
) => {
  try {
    await databaseConnection();

    if (!paymentId || !subscriptionId || !customerId) {
      throw new Error("Parâmetros obrigatórios ausentes.");
    }

    await stripe.subscriptions.cancel(subscriptionId);
    console.log("Assinatura cancelada.");

    const deletedPayment = await Payment.deleteOne({ _id: paymentId });

    if (deletedPayment.deletedCount === 0) {
      console.warn(`Nenhum pagamento encontrado com o ID: ${paymentId}`);
    } else {
      console.log("Pagamento removido do banco de dados.");
    }
  } catch (error) {
    console.error("Erro ao cancelar assinatura e remover usuário:", error);
    throw new Error("Erro interno ao processar a solicitação.");
  }
};

export const hendleGetUserPayment = async (barbeariaId) => {
  await databaseConnection();

  if (!barbeariaId) {
    console.error("Erro: ID da barbearia não foi fornecido!");
    throw new Error("ID da barbearia é obrigatório!");
  }

  const paymentsUserFind = await Payment.find({
    client_reference_id: barbeariaId,
  });

  if (paymentsUserFind.length === 0) {
    console.warn("Nenhum pagamento encontrado para este ID.");
    return null; // Retorna null para indicar que não encontrou nada
  }

  return paymentsUserFind;
};
