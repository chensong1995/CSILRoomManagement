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

## Install nginx, change default config to the config I provide and then restart nginx 
package 'nginx' do
  action :install
end
cookbook_file "nginx-default" do
  path "/etc/nginx/sites-available/default"
end
execute 'nginx-restart' do
  command 'service nginx restart'
end

## Install DB
package 'postgresql' do
  action :install
end
execute 'psql_setup' do
  command 'echo "CREATE DATABASE mydb; CREATE USER ubuntu; GRANT ALL PRIVILEGES ON DATABASE mydb TO ubuntu;" | sudo -u postgres psql'
end
