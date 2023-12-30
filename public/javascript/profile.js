document.addEventListener('DOMContentLoaded', () => {
  const editProfileFormButton = document.getElementById('edit-profile-button');
  const followButton = document.getElementById('follow-button');
  const backgroundProfileForm = document.querySelector('.background-profile-form');
  const editProfileForm = document.querySelector('.edit-profile-form');
  const closeProfileForm = document.getElementById('close-profile-form');
  let inputProfileForm = document.getElementById("display-name-input");
  let textareaProfileForm = document.getElementById("biography-textarea");
  const originalValueProfileForm = inputProfileForm.value;
  const originalBioProfileForm = textareaProfileForm.value;

  const displayNameInput = document.getElementById("display-name-input");
  const displayNameCharLimit = document.getElementById("display-name-char-limit");
  const biographyTextarea = document.getElementById("biography-textarea");
  const biographyCharLimit = document.getElementById("biography-char-limit");

  // 名前入力の文字数制限
  const maxDisplayNameLength = 50;
  // 自己紹介の文字数制限
  const maxBiographyLength = 160;

  if (editProfileFormButton) {
    editProfileFormButton.addEventListener('click', () => {
      backgroundProfileForm.style.display = 'block';
      editProfileForm.style.display = 'block';
      const currentNameLength = displayNameInput.value.length;
      const currentBioLength = biographyTextarea.value.length;
      displayNameCharLimit.textContent = `${currentNameLength} / ${maxDisplayNameLength}`;
      biographyCharLimit.textContent = `${currentBioLength} / ${maxBiographyLength}`;
    });
  } else if (followButton) {
    followButton.addEventListener('click', () => {
      const userId = followButton.getAttribute('data-userid');
      followUser(userId);
    });
  }

  closeProfileForm.addEventListener('click', () => {
      backgroundProfileForm.style.display = 'none';
      editProfileForm.style.display = 'none';
      inputProfileForm.value = originalValueProfileForm;
      textareaProfileForm.value = originalBioProfileForm;
  });
  
  displayNameInput.addEventListener("input", function() {
    const currentLength = displayNameInput.value.length;
    displayNameCharLimit.textContent = `${currentLength} / ${maxDisplayNameLength}`;
    
    if (currentLength > maxDisplayNameLength) {
      displayNameInput.value = displayNameInput.value.substring(0, maxDisplayNameLength);
      displayNameCharLimit.textContent = `${maxDisplayNameLength} / ${maxDisplayNameLength}`;
    }
  });
  
  biographyTextarea.addEventListener("input", function() {
    const currentLength = biographyTextarea.value.length;
    biographyCharLimit.textContent = `${currentLength} / ${maxBiographyLength}`;
    
    if (currentLength > maxBiographyLength) {
      biographyTextarea.value = biographyTextarea.value.substring(0, maxBiographyLength);
      biographyCharLimit.textContent = `${maxBiographyLength} / ${maxBiographyLength}`;
    }
  });


  const followUser = (userId) => {
    const data = { userId: userId };
    fetch('/follow', {
      method: 'POST',
      headers: {
      'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
    .then(response => {
      return response.json();
    })
    .then(data => {
      if (followButton.classList.contains("follow-button")) {
        followButton.textContent = 'フォロー中';
        followButton.classList.remove("follow-button");
        followButton.classList.add("cancel-follow-button");
      } else if (followButton.classList.contains("cancel-follow-button")) {
        followButton.textContent = 'フォロー';
        followButton.classList.remove("cancel-follow-button");
        followButton.classList.add("follow-button");
      }
    })
    .catch(error => {
      console.log(error);
    });
  }
});