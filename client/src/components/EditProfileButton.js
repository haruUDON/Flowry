import React, { useCallback, useContext, useState } from 'react'
import styles from "../styles/EditProfileButton.module.css";
import { UserContext } from '../App';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCameraRotate, faMagnifyingGlassPlus, faMagnifyingGlassMinus, faArrowLeft, faXmark } from '@fortawesome/free-solid-svg-icons';
import Cropper from 'react-easy-crop'
import { useSnackbar } from './Snackbar';

const NAME_LIMIT = 50;
const BIO_LIMIT = 160;

const ASPECT_RATIO = 1;

const EditProfileButton = () => {
  const { user, setUser } = useContext(UserContext);
  const [activePopup, setActivePopup] = useState(false);

  const [isOpenCrop, setIsOpenCrop] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [zoom, setZoom] = useState(1);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  
  const [name, setName] = useState(user.display_name);
  const [bio, setBio] = useState(user.bio);
  
  const { showSnackbar } = useSnackbar();

  const togglePopup = (e) => {
    e.stopPropagation();
    setActivePopup(true);
    setName(user.display_name);
    setBio(user.bio);
    setCroppedImage(null);
  }

  const handleNameChange = (e) => {
    const value = e.target.value;
    if (value.length <= NAME_LIMIT) {
      setName(value);
    }
  };

  const handleBioChange = (e) => {
    const value = e.target.value;
    if (value.length <= BIO_LIMIT) {
      setBio(value);
    }
  };

  const onFileChange = useCallback(async (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        if (reader.result) {
          setImgSrc(reader.result.toString() || '');
          setIsOpenCrop(true);
          setZoom(1);
          setCrop({ x: 0, y: 0 });
        }
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  }, []);

  const handleZoomChange = (event) => {
    const newZoom = parseFloat(event.target.value);
    if (!isNaN(newZoom)) {
      setZoom(newZoom);
    }
  };

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const getCroppedImg = useCallback(() => {
    const image = new Image();
    image.src = imgSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const { width, height } = croppedAreaPixels;
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(image, croppedAreaPixels.x, croppedAreaPixels.y, width, height, 0, 0, width, height);

      const croppedImageBase64 = canvas.toDataURL('image/jpeg');
      setCroppedImage(croppedImageBase64);
      setIsOpenCrop(false)
    };
  }, [croppedAreaPixels, imgSrc]);

  function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  }

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append('name', name);
      formData.append('bio', bio);
      if (croppedImage) formData.append('image', dataURLtoFile(croppedImage, 'croppedImage.jpg'));

      const response = await fetch('/api/profile/edit', {
        method: 'POST',
        body: formData,
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message);
      }

      const { success } = data;
      if (success) {
        setUser(data.user);
        setActivePopup(false);
        showSnackbar(data.message);
      }
    } catch (err) {
      setActivePopup(false);
      showSnackbar(err.message);
    }
  }

  return (
    <>
    <button className={styles.edit} onClick={togglePopup}>プロフィールを編集</button>
    {(activePopup && !isOpenCrop) && (
      <>
      <div className='blackBackground' onClick={() => setActivePopup(false)}></div>
      <div className={styles.popup}>
        <div className={styles.header}>
          <button className={styles.close} onClick={() => setActivePopup(false)}><FontAwesomeIcon icon={faXmark} /></button>
          <button className={styles.save} onClick={handleSave} disabled={(name?.trim()) ? false : true}>保存</button>
        </div>
        <div className={styles.box}>
          <div className={styles.icon}>
            <img src={(croppedImage ? croppedImage : `data:image/jpeg;base64, ${user.icon}`)} alt="Icon" className={styles.iconImg} />
            <label className={styles.uploader}>
              <input type="file" hidden accept="image/*" onChange={onFileChange} />
              <FontAwesomeIcon icon={faCameraRotate} className={styles.camera} />
            </label>
          </div>
        </div>
        <div className={styles.box}>
          <label>
            <div className={styles.above}>
              <span>名前</span>
              <span className={styles.limit}>{name.length} / {NAME_LIMIT}</span>
            </div>
            <input
              className={styles.name}
              type="text"
              value={name}
              onChange={handleNameChange}
            />
          </label>
        </div>
        <div className={styles.box}>
          <label>
            <div className={styles.above}>
              <span>自己紹介</span>
              <span className={styles.limit}>{bio.length} / {BIO_LIMIT}</span>
            </div>
            <textarea
              className={styles.bio}
              type="text"
              value={bio}
              onChange={handleBioChange}
            />
          </label>
        </div>
      </div>
      </>
    )}
    {isOpenCrop && (
      <>
      <div className='blackBackground' onClick={() => setIsOpenCrop(false)}></div>
      <div className={styles.cropPopup}>
        <div className={styles.header}>
          <button className={styles.back} onClick={() => setIsOpenCrop(false)}><FontAwesomeIcon icon={faArrowLeft} /></button>
          <button className={styles.apply} onClick={getCroppedImg}>適用</button>
        </div>
        <div className={styles.crop}>
          <Cropper
            image={imgSrc}
            crop={crop}
            zoom={zoom}
            maxZoom={4}
            aspect={ASPECT_RATIO}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            classes={{
              cropAreaClassName: styles.area
            }}
            showGrid={false}
          />
        </div>
        <div className={styles.bottom}>
          <FontAwesomeIcon className={styles.magnifying} icon={faMagnifyingGlassMinus} />
          <input
            type="range"
            min="1"
            max="4"
            step="0.1"
            value={zoom}
            onChange={handleZoomChange}
          />
          <FontAwesomeIcon className={styles.magnifying} icon={faMagnifyingGlassPlus} />
        </div>
      </div>
      </>
    )}
    </>
  )
}

export default EditProfileButton
