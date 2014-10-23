alias pg-start='pg_ctl -D /usr/local/var/postgres -l /usr/local/var/postgres/server.log start'
alias pg-stop='pg_ctl -D /usr/local/var/postgres stop -s -m fast'
alias pg-status='pg_ctl -D /usr/local/var/postgres status'
alias pg-log='tail /usr/local/var/postgres/server.log'
