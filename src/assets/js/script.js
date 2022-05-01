document.addEventListener('DOMContentLoaded', () => {
  const form = document.querySelector('#fileForm');
  const inputFile = document.querySelector('#sourceFile');
  const emoji = document.querySelector('.emoji');

  form.addEventListener('change', () => {
    if (inputFile.files[0]) {
      emoji.classList.remove('unselect');
      emoji.classList.add('green_check_mark');
    }
  });
});
