(function () {
  // Menu sur téléphone
  var nav = document.getElementById('nav');
  var mb = document.getElementById('menu-btn');
  if (nav && mb) {
    mb.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      mb.setAttribute('aria-expanded', String(open));
    });
  }

  // Bouton « Copier l'adresse »
  var copier = document.getElementById('copier');
  if (copier) {
    copier.addEventListener('click', function () {
      var el = document.getElementById('adresse');
      var txt = el.textContent.trim();
      function ok() { copier.textContent = 'Adresse copiée'; setTimeout(function () { copier.textContent = 'Copier l’adresse'; }, 2000); }
      function repli() { var r = document.createRange(); r.selectNodeContents(el); var sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(r); }
      try { navigator.clipboard.writeText(txt).then(ok, repli); } catch (err) { repli(); }
    });
  }

  // Formulaire de contact
  var form = document.getElementById('formulaire');
  if (!form) return;
  var retour = document.getElementById('retour');
  var bouton = form.querySelector('button[type="submit"]');
  var adresseEnvoi = form.getAttribute('data-envoi') || '';
  var adresseSecours = form.getAttribute('data-email') || '';

  function dire(msg) { retour.textContent = msg; retour.hidden = false; }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var mail = document.getElementById('f-mail'), msg = document.getElementById('f-message');
    if (!mail.value.trim() || !mail.checkValidity()) { dire('Merci d’indiquer une adresse e-mail valide.'); mail.focus(); return; }
    if (!msg.value.trim()) { dire('Merci d’écrire votre message.'); msg.focus(); return; }

    if (!adresseEnvoi) {
      dire('L’envoi par formulaire n’est pas encore activé. Vous pouvez écrire directement à ' + adresseSecours + '.');
      return;
    }

    bouton.disabled = true;
    dire('Envoi en cours…');
    fetch(adresseEnvoi, { method: 'POST', body: new FormData(form), headers: { 'Accept': 'application/json' } })
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        form.reset();
        dire('Merci, votre message a bien été envoyé.');
      })
      .catch(function () {
        dire('Le message n’a pas pu être envoyé. Vous pouvez écrire directement à ' + adresseSecours + '.');
      })
      .finally(function () { bouton.disabled = false; });
  });
})();
