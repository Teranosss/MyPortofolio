// ── SKILL PAGES NAVBAR & THEME TOGGLE ──
(function(){
  // Hamburger Menu
  var btn=document.getElementById('skillHamburger');
  var dd=document.getElementById('skillDropdown');
  var closeBtn=document.getElementById('skillDropdownClose');
  if(btn && dd) {
    function openMenu(){dd.classList.add('open');btn.classList.add('open');btn.setAttribute('aria-expanded','true');}
    function closeMenu(){dd.classList.remove('open');btn.classList.remove('open');btn.setAttribute('aria-expanded','false');}
    btn.addEventListener('click',function(){dd.classList.contains('open')?closeMenu():openMenu();});
    if(closeBtn)closeBtn.addEventListener('click',closeMenu);
    dd.querySelectorAll('.skill-nav-dropdown-link').forEach(function(l){l.addEventListener('click',closeMenu);});
  }

  // Theme Toggle Logic
  var themeToggleBtn = document.getElementById('themeToggleBtn');
  var themeToggleBtnMobile = document.getElementById('themeToggleBtnMobile');

  function updateThemeIcons(theme) {
    [themeToggleBtn, themeToggleBtnMobile].forEach(function(btn) {
      if (!btn) return;
      var sunIcon = btn.querySelector('.sun-icon');
      var moonIcon = btn.querySelector('.moon-icon');
      if (theme === 'light') {
        sunIcon.style.display = 'block';
        moonIcon.style.display = 'none';
      } else {
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'block';
      }
    });
  }

  // Initial Theme Load
  var currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
  updateThemeIcons(currentTheme);

  // Toggle Theme
  function toggleTheme() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    var newTheme = isLight ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcons(newTheme);
  }

  if (themeToggleBtn) themeToggleBtn.addEventListener('click', toggleTheme);
  if (themeToggleBtnMobile) themeToggleBtnMobile.addEventListener('click', toggleTheme);
})();
