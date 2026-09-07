
export interface UserApiResponse {
  status: boolean;
  message: string;
  data: UserData;
}

export interface UserData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  address: string;
  phoneNumber: string;
  profileImage: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}













// export interface UserProfileApiResponse {
//   statusCode: number;
//   success: boolean;
//   message: string;
//   data: IUser;
// }

// export interface IUser {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   fullName: string;
//   email: string;
//   role: string;
//   phone: string;
//   bio: string;
//   profilePicture: string;
//   status: string;
//   createdAt: string;
//   updatedAt: string;
//   __v: number;
//   verifiedForget: boolean;
//   gender: "male" | "female";
//   address: string;
//   phoneNumber: string;
//   postcode: string;
//   city: string;
// }