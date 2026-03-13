export { api, ApiError, httpClient, sessionStore } from './api';

import { api } from './api';

export const storage = {
  getAuthToken: api.session.getAuthToken,
  setAuthToken: api.session.setAuthToken,
  clearAuthToken: api.session.clearAuthToken,
  getCurrentUser: api.session.getCurrentUser,
  setCurrentUser: api.session.setCurrentUser,
  clearCurrentUser: api.session.clearCurrentUser,
  getCurrentUserProfile: api.session.getCurrentUserProfile,
  setCurrentUserProfile: api.session.setCurrentUserProfile,
  clearCurrentUserProfile: api.session.clearCurrentUserProfile,
  getCurrentRoom: api.session.getCurrentRoom,
  setCurrentRoom: api.session.setCurrentRoom,
  clearCurrentRoom: api.session.clearCurrentRoom,
  getRooms: api.rooms.list,
  createRoom: api.rooms.create,
  joinRoom: api.rooms.join,
  getRoom: api.rooms.getById,
  updateRoom: api.rooms.update,
  regenerateInviteCode: api.rooms.regenerateInviteCode,
  deleteRoom: api.rooms.remove,
  getRoommates: api.roommates.listByRoom,
  createRoommate: api.roommates.register,
  addMember: api.roommates.addMember,
  authenticate: api.auth.authenticate,
  getExpenses: api.expenses.listByRoom,
  createExpense: api.expenses.create,
  updateExpenseStatus: api.expenses.updateStatus,
};
