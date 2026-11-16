import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IRefreshToken } from "../interface/auth.interface";
import { RefreshTokenModel } from "../model/refresh-token.model";

class RefreshTokenRepository extends AbstractRepository<IRefreshToken> {
  constructor() {
    super(RefreshTokenModel);
  }

  revokeByJti(jti: string) {
    return this.updateOne({ jti, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
  }

  revokeAllForUser(userId: string) {
    return this.updateMany({ user: userId, revokedAt: { $exists: false } }, { $set: { revokedAt: new Date() } });
  }
}

export const refreshTokenRepository = new RefreshTokenRepository();
