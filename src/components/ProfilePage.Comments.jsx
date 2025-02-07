import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

function ProfilePageComments({ profileId: propProfileId }) {
  const params = useParams();
  const profileId = propProfileId || params.profileId;

  useEffect(() => {
    console.log('Fetching comments for profile ID:', profileId); // debug
  }, [profileId]);

  const [comments, setComments] = useState([]);

  useEffect(() => {
    if (!profileId) return; // wait until we have a valid profileId

    const fetchComments = async () => {
      try {
        const response = await fetch(`/api/forum/user/${profileId}/comments`);
        if (!response.ok) {
          throw new Error('Failed to fetch comments');
        }
        const data = await response.json();
        setComments(data);
      } catch (error) {
        console.error('Error fetching comments:', error);
      }
    };

    fetchComments();
  }, [profileId]);

  return (
    <div>
      <h2>User Comments</h2>
      {comments.length > 0 ? (
        <ul>
          {comments.map(comment => (
            <li key={comment.id}>
              <p>{comment.content}</p>
              <small>Post ID: {comment.postId}</small>
            </li>
          ))}
        </ul>
      ) : (
        <p>No comments found for this user.</p>
      )}
    </div>
  );
}

export default ProfilePageComments;