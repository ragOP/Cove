// Dummy API for user media (gallery)
export async function getUserMedia({ userId }) {
  // Simulate API delay
  await new Promise(res => setTimeout(res, 300));
  // Return dummy media URLs (images/videos)
  return [
    { id: '1', type: 'image', url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb' },
    { id: '2', type: 'image', url: 'https://images.unsplash.com/photo-1465101046530-73398c7f28ca' },
    { id: '3', type: 'image', url: 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308' },
    { id: '4', type: 'image', url: 'https://images.unsplash.com/photo-1502082553048-f009c37129b9' },
    { id: '5', type: 'image', url: 'https://images.unsplash.com/photo-1519985176271-adb1088fa94c' },
    { id: '6', type: 'video', url: 'https://www.w3schools.com/html/mov_bbb.mp4', thumb: 'https://peach.blender.org/wp-content/uploads/title_anouncement.jpg?x11217' },
  ];
}
