{
  description = "pnpm";

  inputs = {
    flake-utils.url = "github:numtide/flake-utils";
    nixpkgs.url = "github:NixOS/nixpkgs/22.11";
  };

  outputs = { self, flake-utils, nixpkgs }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        pnpm = pkgs.nodePackages.pnpm.override {
          nodejs = pkgs.nodejs-18_x;
        };
      in {
        devShell = pkgs.mkShell rec {
          nativeBuildInputs = with pkgs; [
            pnpm
          ];
        };
      }
    );
}
