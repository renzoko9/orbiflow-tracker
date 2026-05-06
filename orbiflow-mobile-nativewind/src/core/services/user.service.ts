import { HttpService } from "./http.service";
import { ENDPOINTS } from "../constants/endpoints.constant";
import {
  UpdateProfileRequest,
  UserResponse,
} from "../dto/auth.interface";

class UserService extends HttpService {
  async getMe(): Promise<UserResponse> {
    return this.get<UserResponse>(ENDPOINTS.users.me);
  }

  async updateProfile(data: UpdateProfileRequest): Promise<UserResponse> {
    return this.patch<UserResponse, UpdateProfileRequest>(
      ENDPOINTS.users.me,
      data,
    );
  }

  async uploadAvatar(asset: {
    uri: string;
    name: string;
    type: string;
  }): Promise<UserResponse> {
    const formData = new FormData();
    formData.append("avatar", {
      uri: asset.uri,
      name: asset.name,
      type: asset.type,
    } as unknown as Blob);

    return this.post<UserResponse, FormData>(
      ENDPOINTS.users.avatar,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        transformRequest: (data) => data,
      },
    );
  }

  async deleteAvatar(): Promise<UserResponse> {
    return this.delete<UserResponse>(ENDPOINTS.users.avatar);
  }
}

export default new UserService();
