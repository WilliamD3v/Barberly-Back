import mongoose from "mongoose";

const employeesSchema = new mongoose.Schema({
  barbearia_id: { type: mongoose.Schema.Types.ObjectId, ref: "Client" },
  name: String,
  schedules: [
    {
      days: [String],
      period: String,
      start_time: String,
      end_time: String,
      time: [
        {
          period_of_day: String,
          start_time: String,
          end_time: String,
        }
      ]
    }
  ],
  ativo: { type: Boolean, default: true }
});

export default mongoose.model.Employees ||
  mongoose.model("Employees", employeesSchema);