# Pavana Video Management System - server setup guideline
**IMPORTANT NOTE** *applying this approach ONLY for DEV purpose*

## Common
- Download & save the .pem key file in your local machine (should be in `~/.ssh/pavana_vms_ec2_keypair.pem`)
- Change file mode: `chmod 400 ~/.ssh/pavana_vms_ec2_keypair.pem`
- Access to the server: `ssh -i ~/.ssh/pavana_vms_ec2_keypair.pem ec2-user@13.229.145.111`

## Server information
- Server 1:
    + Public IP: `13.229.145.111`
    + Access User: `ec2-user`
    + Applications: Backend IAM API, Frontend Web App
    + Database: MySQL 8.0
- Server 2:
    + Public IP: `13.214.127.7`
    + Access User: `ec2-user`
    + Applications: Backend CVM API
    + Database: MongoDB 5.0

### Install MySQL
- Install MySQL 8.0 server & client tools:
    ```
    $ sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm
    $ sudo amazon-linux-extras install epel -y
    $ sudo yum install mysql-community-server
    ```
- Check MySQL installation
    ```
    $ mysql --version
    $ mysql  Ver 8.0.27 for Linux on x86_64 (MySQL Community Server - GPL)
    ```
- Start MySQL server
    ```
    $ sudo systemctl start mysqld
    ```
- Check the server status
    ```
    $ sudo systemctl status mysqld
    ● mysqld.service - MySQL Server
    Loaded: loaded (/usr/lib/systemd/system/mysqld.service; enabled; vendor preset: disabled)
    Active: active (running) since Sun 2021-11-14 16:32:22 UTC; 5s ago
        Docs: man:mysqld(8)
           http://dev.mysql.com/doc/refman/en/using-systemd.html
    Process: 2797 ExecStartPre=/usr/bin/mysqld_pre_systemd (code=exited, status=0/SUCCESS)
    Main PID: 2871 (mysqld)
        Status: "Server is operational"
        CGroup: /system.slice/mysqld.service
           └─2871 /usr/sbin/mysqld

    Nov 14 16:32:16 ip-172-31-14-222.ap-southeast-1.compute.internal systemd[1]: Starting MySQL Server...
    Nov 14 16:32:22 ip-172-31-14-222.ap-southeast-1.compute.internal systemd[1]: Started MySQL Server.
    ```
- Enable MySQL server auto starting on machine boot
    ```
    $ sudo systemctl enable mysqld
    ```
- First-time secure installation setup
    + Get the default initiated root password
        ```
        $ sudo grep 'temporary password' /var/log/mysqld.log
        ```
        => Wrap the password string at the end of the text line (called <first_root_password>)
    + Enter the secure installation setup
        ```
        $ sudo mysql_secure_installation -p<first_root_password>
        ```
        => Type new root password, etc.

### Install MongoDB Community Edition 5.0 (latest)
- Check the Linux distribution to ensure the supported platform (`Amazon Linux 2`)
    ```
    $ grep ^NAME  /etc/*release
    /etc/os-release:NAME="Amazon Linux"
    ```
- Config `yum` with MondoDB repo entry
    ```
    $ sudo vi /etc/yum.repos.d/mongodb-org-5.0.repo
    [mongodb-org-5.0]
    name=MongoDB Repository
    baseurl=https://repo.mongodb.org/yum/amazon/2/mongodb-org/5.0/x86_64/
    gpgcheck=1
    enabled=1
    gpgkey=https://www.mongodb.org/static/pgp/server-5.0.asc
    ```
    Then, update the latest repos
    ```
    $ sudo yum -y update
    ```
- Install latest stable version
    ```
    $ sudo yum install -y mongodb-org
    ```
- Check the installation 
    ```
    $ mongo --version
    $ mongos --version
    $ mongod --version
    $ mongosh --version
    ```
- Start & check the server status
    ```
    $ sudo systemctl daemon-reload
    $ sudo systemctl start mongod
    $ sudo systemctl status mongod
    ● mongod.service - MongoDB Database Server
    Loaded: loaded (/usr/lib/systemd/system/mongod.service; enabled; vendor preset: disabled)
    Active: active (running) since Mon 2021-11-15 10:49:21 UTC; 18s ago
        Docs: https://docs.mongodb.org/manual
    Process: 2771 ExecStart=/usr/bin/mongod $OPTIONS (code=exited, status=0/SUCCESS)
    Process: 2768 ExecStartPre=/usr/bin/chmod 0755 /var/run/mongodb (code=exited, status=0/SUCCESS)
    Process: 2765 ExecStartPre=/usr/bin/chown mongod:mongod /var/run/mongodb (code=exited, status=0/SUCCESS)
    Process: 2763 ExecStartPre=/usr/bin/mkdir -p /var/run/mongodb (code=exited, status=0/SUCCESS)
    Main PID: 2774 (mongod)
    CGroup: /system.slice/mongod.service
            └─2774 /usr/bin/mongod -f /etc/mongod.conf

    Nov 15 10:49:19 ip-172-31-1-50.ap-southeast-1.compute.internal systemd[1]: Starting MongoDB Database Server...
    Nov 15 10:49:19 ip-172-31-1-50.ap-southeast-1.compute.internal mongod[2771]: about to fork child process, waiting until server is ready for connections.
    Nov 15 10:49:19 ip-172-31-1-50.ap-southeast-1.compute.internal mongod[2771]: forked process: 2774
    Nov 15 10:49:21 ip-172-31-1-50.ap-southeast-1.compute.internal systemd[1]: Started MongoDB Database Server.
    ```
- Setup auto starting server on machine boot
    ```
    $ sudo systemctl enable mongod
    ```

### Install Node.js
- Install `nvm` tool
    ```
    $ curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
    $ source ~/.bashrc
    $ nvm --version
    0.39.0
    ```
- Install `Node.js` version (latest LTS of version 14)
    ```
    $ nvm install v14.18.1
    $ node --version
    v14.18.1
    ```
- Install `yarn` tool
    ```
    $ npm install --global yarn
    $ yarn --version
    1.22.17
    ```
- Install `pm2` tool
    ```
    $ npm install pm2 -g
    ```

### Install Git
- Install `git` tool
    ```
    $ sudo yum update -y
    $ sudo yum install git -y
    $ git --version
    git version 2.32.0
    ```

### Install Nginx
- Install `nginx`
    ```
    $ sudo amazon-linux-extras list | grep nginx
    $ sudo amazon-linux-extras enable nginx1
    $ sudo yum -y install nginx
    $ nginx -v
    nginx version: nginx/1.20.0
    ```
- Start `nginx` server
    ```
    $ sudo systemctl start nginx
    $ sudo systemctl status nginx
    ● nginx.service - The nginx HTTP and reverse proxy server
    Loaded: loaded (/usr/lib/systemd/system/nginx.service; disabled; vendor preset: disabled)
    Active: active (running) since Mon 2021-11-15 06:54:48 UTC; 1s ago
    Process: 12106 ExecStart=/usr/sbin/nginx (code=exited, status=0/SUCCESS)
    Process: 12104 ExecStartPre=/usr/sbin/nginx -t (code=exited, status=0/SUCCESS)
    Process: 12101 ExecStartPre=/usr/bin/rm -f /run/nginx.pid (code=exited, status=0/SUCCESS)
    Main PID: 12108 (nginx)
    CGroup: /system.slice/nginx.service
            ├─12108 nginx: master process /usr/sbin/nginx
            ├─12110 nginx: worker process
            └─12111 nginx: worker process

    Nov 15 06:54:48 ip-172-31-14-222.ap-southeast-1.compute.internal systemd[1]: Starting The nginx HTTP and reverse proxy server...
    Nov 15 06:54:48 ip-172-31-14-222.ap-southeast-1.compute.internal nginx[12104]: nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
    Nov 15 06:54:48 ip-172-31-14-222.ap-southeast-1.compute.internal nginx[12104]: nginx: configuration file /etc/nginx/nginx.conf test is successful
    Nov 15 06:54:48 ip-172-31-14-222.ap-southeast-1.compute.internal systemd[1]: Started The nginx HTTP and reverse proxy server.
    ```
- Set auto starting `nginx` on EC2 instance reboot
    ```
    $ sudo systemctl enable nginx
    ```

## Frontend - Web App
- Clone the source code from Gitlab
    ```
    $ mkdir app
    $ git clone git@gitlab.com:t3482/ttlab-pvn-web-app.git
    $ cd ttlab-pvn-web-app
    ```
- Prepare the environment variables
    ```
    $ cp .env.example .env
    ```
    => Here, edit the value as expectation
- Build the web app
    ```
    $ yarn install
    $ yarn build
    $ pwd
    ```
    => Note the directory of `pwd` command here called `web_app_root`
- Set the access permission to the target folder
    ```
    $ sudo chmod o+x /home/ec2-user/app/ttlab-pvn-web-app/dist/
    ```

## Backend - IAM service
### Database Setup
- Access to the database server: `mysql -u root -p` then type your new root password
- Create or use the target database
    ```
    $ CREATE DATABASE IF NOT EXISTS pvn_vms_iam CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
    $ CREATE USER 'pvn_vms_iam'@'%' IDENTIFIED BY '<secret_password_here>';
    $ GRANT ALL PRIVILEGES ON pvn_vms_iam.* TO 'pvn_vms_iam'@'%';
    $ FLUSH PRIVILEGES;
    ```
- Migrate all data tables into the database: https://tokyotechies.atlassian.net/wiki/spaces/TTLAB/pages/1849688099/IAM+data+schema

### Build the app
- Generate SSH Key for Gitlab authentication
    ```
    $ ssh-keygen -t rsa -b 4096 -C "pvn_vms_iam"
    $ eval `ssh-agent -s`
    $ ssh-add ~/.ssh/<private_key_name>
    ```
    => Then, add the public key into Gitlab SSH Keys setting
- Clone the source code from Gitlab
    ```
    $ cd app
    $ git clone git@gitlab.com:t3482/ttlab-pvn-iam.git
    $ cd ttlab-pvn-iam
    ```
- Build the app
    ```
    $ yarn install
    $ yarn build
    ```
- Prepare the `environment variables` file
    ```
    $ cp .env.example .env
    ```
    => Edit the accurate environment variable value in `.env` file
- Start the app
    ```
    $ pm2 start dist/main.js --no-autorestart
    ```

### Config Nginx
- Create config entry file for `IAM` Backend API server
    ```
    $ sudo vi /etc/nginx/conf.d/iam.vms.tokyotechlab.com.conf

    server {
        listen 80;
        server_name dev.iam.vms.tokyotechlab.com;

        location / {
            proxy_pass http://localhost:3000; # Change the port if needed
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
- Create config entry file for Frontend web app
    ```
    $ sudo vi /etc/nginx/conf.d/app.vms.tokyotechlab.com.conf

    server {
        listen 80;
        server_name dev.app.vms.tokyotechlab.com;

        location / {
            root /home/ec2-user/app/ttlab-pvn-web-app/dist/;
            index index.html;
            try_files $uri $uri/ /index.html;
        }
    }
    ```
- Restart `nginx`
    ```
    $ sudo systemctl restart nginx
    ```
### Setup SSL with Let'sEncrypt
- Install `certbot` plugin for `nginx`
    ```
    $ sudo amazon-linux-extras install epel
    $ sudo yum install certbot-nginx
    $ certbot --version
    certbot 1.11.0
    ```
- Execute `certbot`
    ```
    $ sudo certbot --nginx
    ```
    => Answer the questions and finally submit the certificate-invoking requests to all target sub-domains
- Setup auto refresh certificate
    ```
    $ sudo crontab -e
    00      2,14    *       *       *       root    certbot renew --no-self-upgrade && sudo systemctl restart nginx
    $ sudo systemctl restart crond
    ```

## Backend - CVM service
### Database Setup
- Access to the server via `mongosh`
- Create dedicated user account (username & password)
    ```
    test> use admin
    admin> db.createUser(
            {
                user: "pvnCvm",
                pwd: "<plain_password_here>",
                roles: [ 
                    { role: "readWrite", db: "pvnCvmDB" }
                ]
            }
        )
    ```
- Init database
    ```
    test> use pvnCvmDB
    pvnCvmDB> db.createCollection("test")
    pvnCvmDB> db.test.insertOne({ test: "ok" })
    ```
    Then, check database existing
    ```
    test> show dbs
    admin     135 kB
    config    111 kB
    local      41 kB
    pvnCvmDB   41 kB
    ```
- Setup replica set for database
    ```
    $ sudo service mongod stop
    $ mongod --port 27017 --dbpath /srv/mongodb/db0 --replSet rs0 --bind_ip localhost,<hostname(s)|ip address(es)>
    ```
    **Explain command**: config replica set, database path, bind ip address.
        `--dbpath`: path to store your data
        `--replSet`: name of replica set
        `--bind_ip`: ip of host which can access to this db, apply `0.0.0.0` for public accessible
    Connect to mongosh
    ```
    $ mongo sh
    ```
    Init replica set
    ```
    $ rs.initiate()
    ```
    Check status of replica set
    ```
    $ rs.status()
    ```

- Setup remote connection for database
    + **Step 1**: go to the AWS console, find the ec2 instance that running the mongodb server, access to the corresponding Security Group then open the mongo port (default is 27017) for public accessible from any hosts (0.0.0.0)

    + **Step 2**: config mongo allow access for all ip:
        ```
        $ sudo nano /etc/mongod.conf
        ```
        go to the line has a comment: # network interfaces, add the following line: 
        ```
        bindIp: 0.0.0.0
        ```
        ensure that security is enabled:
        ```
        security
            authorization: "enabled"
        ```
    + **Step 3**: connect to mongo via `mongosh` to test the remote connection:
        ```
        mongo -u <user_name> -p <password> <ip_address>/pvnCvmDB
        ```
        Or, using Mongo Compass application with the above connection string:
        ```
        mongodb://<user_name>:<password>@<ip_address>:27017/<db_name>&replicaSet=rs0?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&directConnection=true&ssl=false
        ```


### Build the app
- Generate SSH Key for Gitlab authentication
    ```
    $ ssh-keygen -t rsa -b 4096 -C "pvn_vms_cvm"
    $ eval `ssh-agent -s`
    $ ssh-add ~/.ssh/<private_key_name>
    ```
    => Then, add the public key into Gitlab SSH Keys setting
- Clone the source code from Gitlab
    ```
    $ cd app
    $ git clone git@gitlab.com:t3482/ttlab-pvn-cvm.git
    $ cd ttlab-pvn-cvm
    ```
- Build the app
    ```
    $ yarn install
    $ yarn build
    ```
- Prepare the `environment variables` file
    ```
    $ cp .env.example .env
    ```
    => Edit the accurate environment variable value in `.env` file
- Start the app
    ```
    $ pm2 start dist/main.js --no-autorestart
    ```

### Config Nginx
- Create config entry file for `CVM` Backend API server
    ```
    $ sudo vi /etc/nginx/conf.d/cvm.vms.tokyotechlab.com.conf

    server {
        listen 80;

        server_name dev.cvm.vms.tokyotechlab.com;

        location / {
            proxy_pass http://localhost:3000; # Change the port if needed
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }
    }
    ```
- Restart `nginx`
    ```
    $ sudo systemctl restart nginx
    ```

### Setup SSL with Let'sEncrypt
- Install `certbot` plugin for `nginx`
    ```
    $ sudo amazon-linux-extras install epel
    $ sudo yum install certbot-nginx
    $ certbot --version
    certbot 1.11.0
    ```
- Execute `certbot`
    ```
    $ sudo certbot --nginx
    ```
    => Answer the questions and finally submit the certificate-invoking requests to all target sub-domains
- Setup auto refresh certificate
    ```
    $ sudo crontab -e
    00      2,14    *       *       *       root    certbot renew --no-self-upgrade && sudo systemctl restart nginx
    $ sudo systemctl restart crond
    ```