import User from "../models/user.js";
import Seller from "../models/Seller.js";
import {
  applyVerificationArtifacts,
  createVerificationArtifacts,
  sendVerificationEmail,
  shouldSendVerificationReminder,
} from "./verificationService.js";

let schedulerStarted = false;

async function processModel(Model, actor, forceSend = false) {
  const accounts = await Model.find({
    isVerified: { $ne: true },
    email: { $exists: true, $ne: "" },
  });

  for (const account of accounts) {
    if (!forceSend && !shouldSendVerificationReminder(account)) {
      continue;
    }

    const artifacts = createVerificationArtifacts(account, {
      preserveDeadline: true,
    });

    applyVerificationArtifacts(account, artifacts, { isReminder: true });
    await account.save();

    try {
      await sendVerificationEmail({
        actor,
        account,
        isReminder: Boolean(account.verificationReminderCount),
      });
    } catch (error) {
      console.error(`Failed to send ${actor} verification reminder:`, error.message);
    }
  }
}

export function startVerificationScheduler() {
  if (schedulerStarted) {
    return;
  }

  schedulerStarted = true;

  const run = async (forceSend = false) => {
    try {
      await processModel(User, "user", forceSend);
      await processModel(Seller, "seller", forceSend);
    } catch (error) {
      console.error("Verification scheduler failed:", error.message);
    }
  };

  setTimeout(() => run(true), 15 * 1000);
  setInterval(() => run(false), 6 * 60 * 60 * 1000);
}
