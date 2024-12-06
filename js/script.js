
      function getRandomAccountNumber(length) {
        let result = "";
        const characters = "0123456789";
        for (let i = 0; i < length; i++) {
          result += characters.charAt(
            Math.floor(Math.random() * characters.length)
          );
        }
        return result;
      }

      function mod97(iban) {
        const rearranged = iban.slice(4) + iban.slice(0, 4);
        const numericIban = rearranged.replace(/[A-Z]/g, (letter) =>
          (letter.charCodeAt(0) - 55).toString()
        );
        return BigInt(numericIban) % 97n;
      }

      function calculateCheckDigits(countryCode, bankCode, accountNumber) {
        let checkIban = countryCode + "00" + bankCode + accountNumber;
        let checkDigits = 98n - mod97(checkIban);
        return checkDigits.toString().padStart(2, "0");
      }

      function pseudonymizeIban(iban) {
        return iban.substring(0, 10) + "******" + iban.substring(16);
      }

      function pseudonymizeIbanForApi(iban) {
        const countryCode = iban.slice(0, 2);
        const bankCode = iban.slice(4, 12);
        const randomAccountNumber = getRandomAccountNumber(10);
        const checkDigits = calculateCheckDigits(
          countryCode,
          bankCode,
          randomAccountNumber
        );
        return `${countryCode}${checkDigits}${bankCode}${randomAccountNumber}`;
      }

      function translateError(message) {
        const translations = {
          "Check digit failed": "Prüfziffer fehlgeschlagen",
          "Invalid country code": "Ungültiger Ländercode",
          "Invalid bank code:": "Ungültiger Bankcode:",
          "No BIC found for bank code:": "Keine BIC für Bankcode gefunden:",
          "Unknown error": "Unbekannter Fehler",
        };
        for (const key in translations) {
          if (message.startsWith(key)) {
            return message.replace(key, translations[key]);
          }
        }
        return "Fehler: " + message;
      }

      function showToast(message, type = "error") {
        const toastContainer = document.getElementById("toast-container");
        const toast = document.createElement("div");
        toast.classList.add("toast");
        if (type === "success") {
          toast.classList.add("success");
          toast.innerHTML = `<i>✔</i>${message}`;
        } else {
          toast.innerHTML = `<i>⚠</i>${message}`;
        }
        toastContainer.appendChild(toast);
        setTimeout(() => {
          toast.classList.add("show");
        }, 100);
        setTimeout(() => {
          toast.classList.remove("show");
          setTimeout(() => {
            toast.remove();
          }, 500);
        }, 3000);
      }

      function validateIbanFormat(iban) {
        const ibanRegex = /^[A-Z]{2}\d{2}\d{8}\d{10}$/;
        return ibanRegex.test(iban);
      }

      function checkIBAN() {
        const ibanInput = document
          .getElementById("ibanInput")
          .value.trim()
          .toUpperCase();
        const resultDiv = document.getElementById("result");
        resultDiv.innerHTML = "";

        if (!ibanInput) {
          showToast("Bitte gib eine IBAN ein.", "error");
          return;
        }

        const countryCode = ibanInput.slice(0, 2);
        if (countryCode !== "DE") {
          showToast("Die IBAN muss mit DE beginnen.", "error");
          return;
        }

        if (!validateIbanFormat(ibanInput)) {
          showToast(
            "Ungültiges IBAN-Format. Bitte überprüfe deine Eingabe.",
            "error"
          );
          return;
        }

        if (ibanInput.length !== 22) {
          showToast("Die IBAN muss genau 22 Zeichen lang sein.", "error");
          return;
        }

        const accountNumber = ibanInput.slice(12, 22);
        if (!/^\d{10}$/.test(accountNumber)) {
          showToast("Die Kontonummer darf nur Ziffern enthalten.", "error");
          return;
        }

        let displayedIban = pseudonymizeIban(ibanInput);
        let ibanToSend = pseudonymizeIbanForApi(ibanInput);
        console.log("IBAN an API:", ibanToSend);
        const url = `https://openiban.com/validate/${ibanToSend}?getBIC=true&validateBankCode=true`;

        fetch(url)
          .then((response) => response.json())
          .then((data) => {
            if (data.valid) {
              resultDiv.innerHTML = `
                            <div class="valid"><i>✔</i> Gültige IBAN</div>
                            <table>
                                <tr><th>IBAN</th><td>${displayedIban}</td></tr>
                                <tr><th>Bankname</th><td>${
                                  data.bankData.name
                                }</td></tr>
                                <tr><th>PLZ</th><td>${
                                  data.bankData.zip
                                }</td></tr>
                                <tr><th>Stadt</th><td>${
                                  data.bankData.city
                                }</td></tr>
                                <tr><th>BIC</th><td>${
                                  data.bankData.bic
                                }</td></tr>
                                <tr><th>Bankleitzahl</th><td>${
                                  data.bankData.bankCode
                                }</td></tr>
                                <tr><th>Prüfziffer korrekt</th><td>${
                                  data.checkResults.bankCode ? "Ja" : "Nein"
                                }</td></tr>
                            </table>
                        `;
              resultDiv.className = "valid";
              showToast("IBAN ist gültig.", "success");
            } else {
              const messages = data.messages
                ? data.messages.map((msg) => translateError(msg))
                : ["Unbekannter Fehler"];
              let errorTable = `
                            <div class="invalid">❌ Fehler:</div>
                            <table>
                                <tr><th>Fehlertyp</th><th>Nachricht</th></tr>
                        `;
              messages.forEach((msg) => {
                errorTable += `<tr><td>Fehler</td><td>${msg}</td></tr>`;
              });
              errorTable += `</table>`;
              resultDiv.innerHTML = errorTable;
              resultDiv.className = "invalid";
            }
          })
          .catch((error) => {
            resultDiv.innerHTML = `
                        <div class="invalid">❌ Fehler: ${error.message}</div>
                    `;
            resultDiv.className = "invalid";
          });
      }

      function setDemo() {
        const demoIban = "DE02370502990000684712";
        document.getElementById("ibanInput").value = demoIban;
        checkIBAN();
      }

      function clearInput() {
        document.getElementById("ibanInput").value = "";
        document.getElementById("result").innerHTML = "";
      }

      document
        .getElementById("ibanInput")
        .addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            checkIBAN();
          }
        });

      function setCookie(name, value, days) {
        const d = new Date();
        d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
        const expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value + ";" + expires + ";path=/";
      }

      function getCookie(name) {
        const cname = name + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(";");
        for (let i = 0; i < ca.length; i++) {
          let c = ca[i];
          while (c.charAt(0) == " ") {
            c = c.substring(1);
          }
          if (c.indexOf(cname) == 0) {
            return c.substring(cname.length, c.length);
          }
        }
        return "";
      }

      function closeModal() {
        document.getElementById("modal").style.display = "none";
        setCookie("modalClosed", "true", 7);
      }

      window.onload = function () {
        if (!getCookie("modalClosed")) {
          document.getElementById("modal").style.display = "flex";
        }
      };
