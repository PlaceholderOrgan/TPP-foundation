import React, { useEffect, useState } from 'react';
import { Route, Link, Routes, useNavigate, useParams } from 'react-router-dom';
import ProfilePageMain from './ProfilePage.Main';
import ProfilePageComments from './ProfilePage.Comments';
import ProfilePagePosts from './ProfilePage.Posts';

function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { profileId } = useParams();
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('isAdmin');
    alert('Logged out');
    window.location.href = '/';
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Profile Page</h1>
      {currentUserId && <button onClick={handleLogout}>Logout</button>}
      <nav>
        <ul>
          <li>
            <Link to={`/profile/${profileId}`}>Main</Link>
          </li>
          <li>
            <Link to={`/profile/${profileId}/comments`}>Comments</Link>
          </li>
          <li>
            <Link to={`/profile/${profileId}/posts`}>Posts</Link>
          </li>
        </ul>
      </nav>

      <Routes>
        <Route path="/" element={<ProfilePageMain profileId={profileId} />} />
        <Route path="/comments" element={<ProfilePageComments profileId={profileId} />} />
        <Route path="/posts" element={<ProfilePagePosts />} />
      </Routes>
    </div>
  );
}

export default ProfilePage;