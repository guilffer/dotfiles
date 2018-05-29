function growl() {
  terminal-notifier -title "Pssssst !!" -subtitle "A message from your shell:" -message "$@"
}

function groooowl() {
  terminal-notifier -title "Pssssst !!" -subtitle "A message from your shell:" -message "$@"
  say "$@"
}
