import { supabase } from "../supabaseClient";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";

const CreateUser = () => {
  const navigate = useNavigate();
  const [userType, setUserType] = useState('');
  const [firstname, setFirstName] = useState('');
  const [lastname, setLastName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);
  const [uploadedPictureUrl, setUploadedPictureUrl] = useState(null);
  const [formError, setFormError] = useState(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePicture(file);
  };

  const uploadProfilePicture = async () => {
    if (!profilePicture) return null;

    const fileName = `${Date.now()}_${profilePicture.name}`;
    const { data, error } = await supabase.storage
      .from('avatars')
      .upload(fileName, profilePicture);

    if (error) {
      console.error("Error uploading profile picture:", error);
      setFormError("Error uploading profile picture");
      return null;
    }

    const { publicURL } = supabase.storage
      .from('avatars')
      .getPublicUrl(fileName);

    return publicURL;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!firstname || !lastname || !userType) {
      setFormError('Please fill in all the required fields');
      return;
    }

    const profilePictureUrl = await uploadProfilePicture();

    if (formError) return;

    const { data, error, status } = await supabase
      .from('users')
      .insert([{ firstname, lastname, usertype: userType, profile_picture: profilePictureUrl }]);

    if (error) {
      if (status === 409) {
        setFormError('A user with this information already exists.');
      } else {
        setFormError('Error submitting form');
      }
      console.error(error);
    } else {
      setFormError(null);
      if (userType === 'client') {
        navigate('/dashboard');
      } else {
        navigate('/update-profile');
      }
    }
  };

  return (
    <div className="formcontainer">
      <form id="setuserform" onSubmit={handleSubmit}>
        <div className="input-container"></div>
          <h1 className="header text-center">Tell us more <br /> about yourself</h1>
          
          <label className="label" htmlFor="profile-picture">Profile Picture</label>
          <input
            type="file"
            id="profile-picture"
            accept="image/*"
            onChange={handleFileChange}
          />
          {uploadedPictureUrl && (
            <div>
              <img src={uploadedPictureUrl} alt="Uploaded Profile" className="profile-preview" />
              <button type="button" onClick={() => setUploadedPictureUrl(null)}>Change Picture</button>
            </div>
          )}

          <label className="label" htmlFor="first-name">First Name</label>
          <input
            type="text"
            id="first-name"
            value={firstname}
            onChange={(e) => setFirstName(e.target.value)}
          />

          <label className="label" htmlFor="last-name">Last Name</label>
          <input
            type="text"
            id="last-name"
            value={lastname}
            onChange={(e) => setLastName(e.target.value)}
          />

          <label className="label text-center" htmlFor="usertype">What will you use SkillUp as?</label>
          <div className="radio-container">
            <label className="label radiolabel" htmlFor="client">
              <input
                type="radio"
                id="client"
                name="usertype"
                value="client"
                onChange={(e) => setUserType(e.target.value)} />
              Client
            </label>

            <label className="label radiolabel" htmlFor="freelancer">
              <input
                type="radio"
                id="freelancer"
                name="usertype"
                value="freelancer"
                onChange={(e) => setUserType(e.target.value)} />
              Freelancer
            </label>
          </div>

          

          <button>Next</button>
          {formError && <p className="error text-red-600 text-xl font-bold">{formError}</p>}
      </form>
    </div>
  );
};

export default CreateUser;
