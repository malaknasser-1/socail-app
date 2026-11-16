import { AbstractRepository } from "../../../lib/db/abstract.repository";
import { IUser } from "../interface/user.interface";
import { UserModel } from "../model/user.model";

class UserRepository extends AbstractRepository<IUser> {
  constructor() {
    super(UserModel);
  }

  findByEmail(email: string, withPassword = false) {
    const q = this.findOne({ email: email.toLowerCase() });
    return withPassword ? q.select("+password") : q;
  }
}

export const userRepository = new UserRepository();
