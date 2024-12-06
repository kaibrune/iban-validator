# iban-validator

Dieses Skript dient der Validierung einer eingegebenen deutschen IBAN unter Nutzung des Dienstes openiban.com. Dabei überprüft das Skript die IBAN anhand verschiedener Gütekriterien, um deren Gültigkeit und Richtigkeit sicherzustellen. Zu den überprüften Kriterien gehören unter anderem die korrekte Struktur der IBAN, die Richtigkeit der Prüfziffer sowie die Existenz des zugrunde liegenden Bankkontos.

Zusätzlich sorgt das Skript für den Schutz sensibler Daten, indem der Teil der Kontonummer pseudonymisiert wird. Dies bedeutet, dass die Formfaktoren zwar überprüft, aber in der Übermittlung die Kontonummer durch zufällige Nummern ausgetauscht wird.

--

Dieses Script dient nur zu Demo-Zwecken. Bitte geben Sie keine echten Daten ein. Die eingebenen Daten werden mit openiban.com teilweise pseudonymisiert abgeglichen. Bitte vergewisseren Sie sich, dass die eingebenen Daten für diesen Zweck freigegeben sind. Es wird keine Haftung übernommen.