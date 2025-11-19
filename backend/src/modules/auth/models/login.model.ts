import { LoginTokensResponse } from '../../../common/models/tokens.model';
import { UserResponse } from './user.model';

export interface LoginResponse {
  usuario: UserResponse;
  tokens: LoginTokensResponse;
}
