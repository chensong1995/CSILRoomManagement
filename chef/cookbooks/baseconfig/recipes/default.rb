# Make sure the Apt package lists are up to date, so we're downloading versions that exist.
cookbook_file "apt-sources.list" do
  path "/etc/apt/sources.list"
end
execute 'apt_update' do
  command 'apt-get update'
end

# Base configuration recipe in Chef.
package "wget"
package "ntp"
cookbook_file "ntp.conf" do
  path "/etc/ntp.conf"
end
execute 'ntp_restart' do
  command 'service ntp restart'
end
execute 'time_zone_setting' do
  command 'timedatectl set-timezone America/Vancouver'
end

# Node.js
execute 'add-NodeSource-APT' do
  command 'curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -'
end
package 'nodejs'
package 'build-essential'

## Install nginx, change default config to the config I provide and then restart nginx 
package 'nginx' do
  action :install
end
cookbook_file "nginx-default" do
  path "/etc/nginx/sites-available/default"
end
cookbook_file "nginx.conf" do
  path "/etc/nginx/nginx.conf"
end
execute 'nginx-restart' do
  command 'service nginx restart'
end

## Install DB
package 'mysql-server'
cookbook_file "my.conf" do
  path "/etc/mysql/my.cnf"
end
execute 'mysql-start' do
  command "sudo service mysql restart"
end
execute 'mysql-create-user' do
  sql = "\"CREATE USER IF NOT EXISTS \'csil\'@\'localhost\' IDENTIFIED BY \'csil\';\""
  command "echo #{sql} | sudo mysql"
end
execute 'mysql-drop-db' do
  command "echo \"DROP DATABASE IF EXISTS csil;\" | sudo mysql"
end
execute 'mysql-create-db' do
  command "echo \"CREATE DATABASE csil CHARACTER SET UTF8 COLLATE utf8_general_ci;\" | sudo mysql"
end
execute 'mysql-grant-access' do
  sql = "\"GRANT ALL ON csil.* TO \'csil\'@\'localhost\';\""
  command "echo #{sql} | sudo mysql"
end
execute 'mysql-insert-data' do
  command "cat /home/ubuntu/project/csil.sql | sudo mysql csil"
end

# node packages
execute 'node-packages' do
  cwd '/home/ubuntu/project/'
  command 'npm install --no-bin-links'
end

## Install forever to run the server as a daemon process 
execute 'install_forever' do
  command 'npm install forever -g' 
end

# Install webpack
execute 'install_webpack' do
	command 'sudo npm install webpack'
	command 'sudo npm install --g webpack'
end

# start server
execute 'node-terminate' do
  command 'forever stopall'
end
execute 'node-start' do
  command 'forever start /home/ubuntu/project/index.js'
end
execute 'notifier-start' do
  command 'forever start /home/ubuntu/project/notifier.js'
end
