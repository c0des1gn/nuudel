// role
export enum UserType {
  Admin = 'Admin', // Owner, Full Control
  Manager = 'Manager', // Publisher, Approver, Reviewer, Seller, Steward, Operator
  User = 'User', // Editer, Contributor, Member
  Viewer = 'Viewer', // Viewer, Visitor, Reader, Observer, Courier
  Guest = 'Guest', // View Only, not an user
}
