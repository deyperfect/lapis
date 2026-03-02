import api from "./api";

export const getPosts = (params) => api.get("/posts", { params });
export const getPostById = (postId) => api.get(`/posts/${postId}`);
export const createPost = (payload) => api.post("/posts", payload);
export const updatePost = (postId, payload) => api.patch(`/posts/${postId}`, payload);
export const deletePost = (postId) => api.delete(`/posts/${postId}`);