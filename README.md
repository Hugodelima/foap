# Versão do postgres criado em um container utilizando docker
PostgreSQL 17.2 (Debian 17.2-1.pgdg120+1) on x86_64-pc-linux-gnu, compiled by gcc (Debian 12.2.0-14) 12.2.0, 64-bit

# Configurando o .env
EMAIL_USER = "XXXX@gmail.com"  
EMAIL_PASS = "XXXX"

DB_USERNAME: 'postgres'  
DB_PASSWORD: 'postgres'  
DB_NAMEDATABASE: 'foap'  
DB_HOST: 'localhost'  
DB_DIALECT: 'postgres'  
FIXED_SALT = 'dfgdfgdfg2423432'  

API_URL=http://192.168.0.105:3000 # ip do servidor junto com a porta  
PORT=3000
