import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

function ProfilePageMain({ profileId }) {
    const [profileData, setProfileData] = useState({
        statusMessage: '',
        description: '',
        username: ''
    });
    const [isEditing, setIsEditing] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [isCurrentUserProfile, setIsCurrentUserProfile] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const baseUrl = window.location.hostname === 'localhost'
                    ? 'http://localhost:5000/api'
                    : 'http://spackcloud.duckdns.org:5000/api';

                const headers = {
                    'Content-Type': 'application/json'
                };
                
                // Add authorization header only if token exists
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }

                const response = await fetch(`${baseUrl}/users/${profileId}`, {
                    method: 'GET',
                    headers: headers
                });

                if (response.ok) {
                    const data = await response.json();
                    setProfileData({
                        statusMessage: data.status_message || '',
                        description: data.description || '',
                        username: data.username || ''
                    });
                    
                    // Check if current user is viewing their own profile
                    if (token) {
                        const decodedToken = jwtDecode(token);
                        setIsCurrentUserProfile(String(decodedToken.userId) === profileId);
                    }
                } else {
                    console.error('Failed to fetch profile:', response.status);
                }
            } catch (error) {
                console.error('Error fetching profile:', error);
            }
        };

        fetchProfile();
    }, [profileId, token]);

    const handleSave = async () => {
        if (!token || !isCurrentUserProfile) {
            alert('Not authorized to edit this profile');
            return;
        }

        try {
            const baseUrl = window.location.hostname === 'localhost'
                ? 'http://localhost:5000'
                : 'http://spackcloud.duckdns.org:5000';

            const response = await fetch(`${baseUrl}/api/users/${profileId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({ 
                    status_message: profileData.statusMessage, 
                    description: profileData.description 
                }),
            });

            if (response.ok) {
                alert('Profile updated successfully!');
                setIsEditing(false);
                
                // Refresh token
                const newTokenResponse = await fetch(`${baseUrl}/api/users/token/refresh`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (newTokenResponse.ok) {
                    const { token: newToken } = await newTokenResponse.json();
                    localStorage.setItem('authToken', newToken);
                    setToken(newToken);
                }
            } else {
                alert('Failed to update profile');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error updating profile');
        }
    };

    return (
        <div>
            <h2>Profile: {profileData.username}</h2>

            {isCurrentUserProfile && !isEditing && (
                <button onClick={() => setIsEditing(true)}>Edit Profile</button>
            )}

            {isEditing && isCurrentUserProfile ? (
                <>
                    <div>
                        <label>Status Message:</label>
                        <input
                            type="text"
                            value={profileData.statusMessage}
                            onChange={(e) => setProfileData({
                                ...profileData,
                                statusMessage: e.target.value
                            })}
                        />
                    </div>

                    <div>
                        <label>Description:</label>
                        <textarea
                            value={profileData.description}
                            onChange={(e) => setProfileData({
                                ...profileData,
                                description: e.target.value
                            })}
                        />
                    </div>

                    <button onClick={handleSave}>Save</button>
                    <button onClick={() => setIsEditing(false)}>Cancel</button>
                </>
            ) : (
                <>
                    <div>
                        <label>Status Message:</label>
                        <p>{profileData.statusMessage}</p>
                    </div>
                    <div>
                        <label>Description:</label>
                        <p>{profileData.description}</p>
                    </div>
                </>
            )}
        </div>
    );
}

export default ProfilePageMain;