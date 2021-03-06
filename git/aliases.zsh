# Use `hub` as our git wrapper:
#   http://defunkt.github.com/hub/
hub_path=$(which hub)
if (( $+commands[hub] ))
then
  alias git=$hub_path
fi

# The rest of my fun git aliases
alias gpl='git pull'
alias glog="git log --graph --pretty=format:'%Cred%h%Creset %an: %s - %Creset %C(yellow)%d%Creset %Cgreen(%cr)%Creset' --abbrev-commit --date=relative"
alias gps='git push'
alias gpss="git track && git push"
alias gd='git diff'
alias gds='git diff --staged'
alias gcm='git commit'
alias gco='git checkout'
alias gcb='git copy-branch-name'
alias gst='git status'
alias gs='gst -sb' # upgrade your git if -sb breaks for you. it's fun.
alias gfe='git fetch'
alias gre='git rebase'
