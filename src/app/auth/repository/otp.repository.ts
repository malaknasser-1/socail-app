import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IOtp } from "../interface/auth.interface";
import { OtpModel } from "../model/otp.model";
import { OtpPurpose } from "../enum/otp-purpose.enum";

class OtpRepository extends AbstractRepository<IOtp> {
  constructor() {
    super(OtpModel);
  }

  upsert(email: string, purpose: OtpPurpose, codeHash: string, expiresAt: Date) {
    return this.findOneAndUpdate(
      { email, purpose },
      { $set: { codeHash, expiresAt, attempts: 0 } },
      { upsert: true }
    );
  }
}

export const otpRepository = new OtpRepository();
