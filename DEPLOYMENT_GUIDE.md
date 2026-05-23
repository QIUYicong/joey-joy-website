# Joey's Joy — Self-Hosting Deployment Guide

## Project Structure

```
joey-joy-website/
├── index.html                    # Main hub page
├── sections/
│   ├── poetry-portfolio.html     # 诗岚观 - Portfolio
│   ├── research.html             # 问穹鼎 - Research
│   ├── essays.html               # 众生苦 - Essays
│   └── gallery.html              # 迷思觅 - Gallery
├── assets/
│   ├── css/
│   │   └── style.css             # Global styles (optional)
│   ├── js/
│   │   └── main.js               # Global scripts (optional)
│   └── images/
│       └── [your images here]
└── DEPLOYMENT_GUIDE.md           # This file
```

## Quick Start (Local Testing)

1. **Open locally in browser:**
   - Simply double-click `index.html` to preview
   - Or run a local server:
     ```bash
     cd joey-joy-website
     python -m http.server 8000
     # Visit http://localhost:8000
     ```

2. **Python 3:**
   ```bash
   python -m http.server 8000
   ```

3. **Node.js (http-server):**
   ```bash
   npx http-server . -p 8000
   ```

## Self-Hosting Options

### Option 1: Shared Hosting (Easiest)

**Best for:** Beginners, minimal technical setup

1. Purchase hosting from: GoDaddy, Bluehost, HostGator, etc.
2. Use their file manager or FTP client to upload files:
   - Upload the entire `joey-joy-website` folder content
   - Ensure `index.html` is in the root directory
3. Point your domain to the hosting provider
4. Done! Your site is live

**FTP Upload (using FileZilla):**
```
Host: your-hosting-provider-ftp-address
Username: your-cpanel-username
Password: your-cpanel-password
Port: 21
```

---

### Option 2: VPS / Cloud Server (Recommended for Control)

**Best for:** More control, better performance, scalability

#### Using Nginx (Ubuntu/Debian)

1. **SSH into your server:**
   ```bash
   ssh root@your-server-ip
   ```

2. **Install Nginx:**
   ```bash
   sudo apt update
   sudo apt install nginx
   ```

3. **Upload your files:**
   ```bash
   scp -r ./joey-joy-website/* root@your-server-ip:/var/www/joeys-joy/
   ```

4. **Create Nginx config:**
   ```bash
   sudo nano /etc/nginx/sites-available/joeys-joy
   ```

   Paste this:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com www.your-domain.com;

       root /var/www/joeys-joy;
       index index.html;

       location / {
           try_files $uri $uri/ =404;
       }

       # Cache static assets
       location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
           expires 1y;
           add_header Cache-Control "public, immutable";
       }

       # Gzip compression
       gzip on;
       gzip_types text/plain text/css text/javascript application/json application/javascript;
   }
   ```

5. **Enable the site:**
   ```bash
   sudo ln -s /etc/nginx/sites-available/joeys-joy /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

6. **Set up SSL (Free with Let's Encrypt):**
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   ```

---

#### Using Apache (Alternative)

1. **Install Apache:**
   ```bash
   sudo apt install apache2
   ```

2. **Upload files:**
   ```bash
   scp -r ./joey-joy-website/* root@your-server-ip:/var/www/html/joeys-joy/
   ```

3. **Create .htaccess for proper routing:**
   Create `/var/www/html/joeys-joy/.htaccess`:
   ```apache
   <IfModule mod_rewrite.c>
       RewriteEngine On
       RewriteBase /joeys-joy/
       
       # Don't rewrite existing files/directories
       RewriteCond %{REQUEST_FILENAME} !-f
       RewriteCond %{REQUEST_FILENAME} !-d
       
       # Rewrite to index.html for SPA-like behavior (if needed)
       RewriteRule ^(.*)$ index.html [L]
   </IfModule>

   # Enable gzip compression
   <IfModule mod_deflate.c>
       AddOutputFilterByType DEFLATE text/html text/plain text/css text/javascript application/javascript application/json
   </IfModule>

   # Set cache headers
   <FilesMatch "\.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$">
       Header set Cache-Control "max-age=31536000, public"
   </FilesMatch>
   ```

4. **Enable mod_rewrite:**
   ```bash
   sudo a2enmod rewrite
   sudo a2enmod deflate
   sudo systemctl restart apache2
   ```

5. **Set up SSL:**
   ```bash
   sudo apt install certbot python3-certbot-apache
   sudo certbot --apache -d your-domain.com
   ```

---

### Option 3: Static Hosting (Simplest, Free)

**Best for:** Free hosting, no backend needed

**Netlify:**
- Drag and drop your `joey-joy-website` folder
- Connect your domain
- Auto-HTTPS, auto-deploy on updates
- Free tier covers personal projects
- Visit: https://netlify.com

**Vercel:**
- Similar to Netlify, optimized for web apps
- Visit: https://vercel.com

**GitHub Pages:**
1. Push your files to a GitHub repo
2. Enable GitHub Pages in Settings
3. Site goes live at `username.github.io/joey-joy`

---

## Domain Setup

### Point Domain to Your Server

1. **Get a domain:** Namecheap, GoDaddy, Google Domains, etc.
2. **Update DNS records** in your registrar's dashboard:

   | Type | Name | Value |
   |------|------|-------|
   | A | @ | your-server-ip |
   | A | www | your-server-ip |
   | CNAME | www | your-domain.com (sometimes) |

3. **Wait 24-48 hours** for DNS propagation
4. **Check:**
   ```bash
   nslookup your-domain.com
   ```

---

## Customization & Content Management

### Adding Real Content

1. **Images & Media:**
   - Create `assets/images/` folder
   - Replace emoji placeholders with real images
   - Update HTML to reference your images:
     ```html
     <img src="../assets/images/your-image.jpg" alt="Description">
     ```

2. **Edit Text Content:**
   - Open each `.html` file in any text editor
   - Update titles, descriptions, dates
   - Keep HTML structure intact

3. **Add More Works/Essays:**
   - Copy `.work-card` / `.essay` / `.gallery-item` blocks
   - Update content inside
   - The styles will apply automatically

### Color Customization

The site uses a cohesive color palette. To change colors globally, edit the CSS color values:

- **Primary Cyan:** `#64c8ff` → Change to your color
- **Primary Purple:** `#b090ff` → Change to your color
- **Dark Background:** `#0a0e27` → Change to your color

Find and replace in each HTML file, or create a shared CSS file.

---

## Performance Optimization

### Compress Images
```bash
# Using ImageMagick
convert input.jpg -quality 85 -resize 1920x1080 output.jpg
```

### Minify CSS/JS (Optional)
Use online tools or:
```bash
npm install -g cssnano uglify-js
cssnano style.css > style.min.css
uglifyjs main.js > main.min.js
```

### Enable Caching Headers
Already included in Nginx/Apache configs above.

---

## Monitoring & Maintenance

### Check Site Health
```bash
curl -I https://your-domain.com
# Should return HTTP 200
```

### Server Monitoring (Nginx)
```bash
# Check if running
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/error.log

# View access logs
sudo tail -f /var/log/nginx/access.log
```

### SSL Certificate Renewal (Let's Encrypt)
```bash
# Automatic renewal (already configured)
sudo certbot renew --dry-run

# Manual renewal
sudo certbot renew
```

---

## Backup Strategy

### Manual Backup
```bash
# From your local machine
scp -r root@your-server-ip:/var/www/joeys-joy ./backup-joeys-joy-$(date +%Y%m%d)
```

### Automated Backup (Cron)
```bash
# Add to crontab (run daily at 2 AM)
0 2 * * * tar -czf /home/user/backups/joeys-joy-$(date +\%Y\%m\%d).tar.gz /var/www/joeys-joy/
```

---

## Troubleshooting

**Site shows 404:**
- Check file paths in HTML (relative paths should work)
- Verify files are uploaded correctly
- Clear browser cache

**Styles not loading:**
- Check CSS file paths
- Ensure correct folder structure
- Verify permissions: `chmod -R 755 /var/www/joeys-joy/`

**Slow performance:**
- Enable gzip compression (configs above)
- Compress images
- Enable caching headers

**SSL certificate issues:**
- Ensure domain is pointing to correct server
- Run: `sudo certbot --nginx -d your-domain.com`
- Check: `certbot certificates`

---

## Next Steps

1. ✅ Test locally with `python -m http.server`
2. ✅ Choose hosting option (Shared, VPS, or Static)
3. ✅ Register domain
4. ✅ Upload files & configure server
5. ✅ Point domain to server
6. ✅ Set up SSL certificate
7. ✅ Add your own content (images, text)
8. ✅ Test all links work
9. ✅ Monitor and maintain

---

## Support Resources

- **Nginx docs:** https://nginx.org/en/docs/
- **Apache docs:** https://httpd.apache.org/docs/
- **Let's Encrypt:** https://letsencrypt.org/
- **DNS Help:** https://mxtoolbox.com/
- **Server monitoring:** https://www.uptimerobot.com/

---

**Enjoy your personal website! 🎉**