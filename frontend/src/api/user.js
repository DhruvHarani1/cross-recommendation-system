import api from './axios';

export const getSampleItems = async (categories, limit = 6) => {
  try {
    const promises = categories.map((t) =>
      api.get(`/content/popular?type=${t}&limit=${limit}`)
    );
    const results = await Promise.all(promises);
    const allItems = results.flatMap((r) => r.data.results || []);
    return { items: allItems };
  } catch (err) {
    console.error("Failed to fetch sample items", err);
    throw err;
  }
};

export const onboardUser = async (userId, displayName, anchors, favoriteTypes, keywords) => {
  try {
    const token = localStorage.getItem('crossrec_access_token');
    const res = await api.post(`/users/${userId}/onboard-preferences`, {
      favorite_types: favoriteTypes,
      keywords: keywords,
      anchors: anchors,
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error("Failed to onboard user", err);
    throw err;
  }
};

export const getLibrary = async (userId) => {
  try {
    const token = localStorage.getItem('crossrec_access_token');
    const res = await api.get(`/users/${userId}/library`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data.items || [];
  } catch (err) {
    console.error("Failed to fetch library", err);
    throw err;
  }
};

export const saveToLibrary = async (userId, contentId, contentType) => {
  try {
    const token = localStorage.getItem('crossrec_access_token');
    const res = await api.post(`/users/${userId}/library`, {
      content_id: contentId,
      content_type: contentType
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error("Failed to save to library", err);
    throw err;
  }
};

export const removeFromLibrary = async (userId, contentId, contentType) => {
  try {
    const token = localStorage.getItem('crossrec_access_token');
    const res = await api.delete(`/users/${userId}/library/${contentType}/${contentId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return res.data;
  } catch (err) {
    console.error("Failed to remove from library", err);
    throw err;
  }
};
