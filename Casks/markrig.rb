cask "markrig" do
  version "0.1.0"
  sha256 :no_check

  url "https://github.com/maxlibin/markrig/releases/download/v#{version}/markrig_#{version}_universal.dmg"
  name "markrig"
  desc "Live viewer and editor for Claude Code markdown plans"
  homepage "https://github.com/maxlibin/markrig"

  app "markrig.app"
end
