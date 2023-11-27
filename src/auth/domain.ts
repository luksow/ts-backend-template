import { Email, Role, UserId } from '../user/domain';

export class AuthContext {
  constructor(
    public id: UserId,
    public email: Email,
    public roles: Array<Role>,
  ) {}

  isAdmin(): boolean {
    return this.roles.includes('Admin');
  }
}
