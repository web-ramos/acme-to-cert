import fs from 'fs';
import path from 'path';

// Путь к файлу acme.json
const acmeFilePath = path.join(__dirname, 'acme.json');
// Директория для сохранения экспортированных сертификатов
const outputDir = path.join(__dirname, 'certs');

// Чтение и парсинг acme.json
fs.readFile(acmeFilePath, 'utf8', (err, data) => {
  if (err) {
    console.error('Ошибка при чтении файла acme.json:', err);
    return;
  }

  const acmeData = JSON.parse(data);
  if (!acmeData || !acmeData['letsencrypt'] || !acmeData['letsencrypt']['Certificates']) {
    console.error('Сертификаты не найдены в acme.json.');
    return;
  }

  acmeData['letsencrypt']['Certificates'].forEach((cert: any) => {
    if (cert.certificate && cert.key) {
      const domainName = cert.domain.main;
      const certDir = path.join(outputDir, domainName);
      if (!fs.existsSync(certDir)) {
        fs.mkdirSync(certDir, { recursive: true });
      }

      // Декодирование и сохранение сертификата
      const certContent = Buffer.from(cert.certificate, 'base64').toString('utf8');
      const certPath = path.join(certDir, 'certificate.crt');
      fs.writeFileSync(certPath, certContent);
      console.log(`Сертификат для ${domainName} сохранен в: ${certPath}`);

      // Декодирование и сохранение ключа
      const keyContent = Buffer.from(cert.key, 'base64').toString('utf8');
      const keyPath = path.join(certDir, 'private.key');
      fs.writeFileSync(keyPath, keyContent);
      console.log(`Ключ для ${domainName} сохранен в: ${keyPath}`);
    }
  });
});