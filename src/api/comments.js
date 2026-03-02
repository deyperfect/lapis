import api from "./api";

export const getComments = (postId) => api.get(`/posts/${postId}/comments`);
export const addComment = (postId, payload) => api.post(`/posts/${postId}/comments`, payload);
export const updateComment = (postId, commentId, payload) =>
  api.patch(`/posts/${postId}/comments/${commentId}`, payload);
export const deleteComment = (postId, commentId) =>
  api.delete(`/posts/${postId}/comments/${commentId}`);