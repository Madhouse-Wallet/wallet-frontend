import React from "react";
import styled from "styled-components";

const InstallFirstApp = () => {
  return (
    <>
      <div className="flex w-full flex-col items-center justify-center">
        <FirstAppSec className="grid w-full max-w-md gap-[30px] px-2 lg:max-w-[1200px] lg:grid-cols-3 lg:px-[30px]">
          <div className="cardCstm rounded-20 backdrop-blur-2xl contrast-more:backdrop-blur-none bg-blend-soft-light bg-gradient-to-b from-black/50 via-black/50 to-black contrast-more:bg-neutral-800 px-4 py-8 shadow-dialog flex flex-col gap-4 min-w-0">
            <h2 className="text-center text-19 font-bold leading-tight -tracking-2">
              For the self-hoster
            </h2>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/nextcloud"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/nextcloud/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Nextcloud</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Productivity platform that keeps you in control
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/immich"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/immich/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Immich</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  High-performance photo and video backup solution
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/home-assistant"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/home-assistant/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">
                  Home Assistant
                </h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Home automation that puts local control &amp; privacy first
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/pi-hole"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/pi-hole/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Pi-hole</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Block ads on your entire network
                </p>
              </div>
            </a>
          </div>
          <div className="cardCstm rounded-20 backdrop-blur-2xl contrast-more:backdrop-blur-none bg-blend-soft-light bg-gradient-to-b from-black/50 via-black/50 to-black contrast-more:bg-neutral-800 px-4 py-8 shadow-dialog flex flex-col gap-4 min-w-0">
            <h2 className="text-center text-19 font-bold leading-tight -tracking-2">
              For the Bitcoiner
            </h2>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/bitcoin"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/bitcoin/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">
                  Bitcoin Node
                </h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Run your personal node powered by Bitcoin Core
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/lightning"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/lightning/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">
                  Lightning Node
                </h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Run your personal Lightning Network node
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/electrs"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/electrs/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Electrs</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  A simple and efficient Electrum Server
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/mempool"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/mempool/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">mempool</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Explore the full Bitcoin ecosystem
                </p>
              </div>
            </a>
          </div>
          <div className="cardCstm rounded-20 backdrop-blur-2xl contrast-more:backdrop-blur-none bg-blend-soft-light bg-gradient-to-b from-black/50 via-black/50 to-black contrast-more:bg-neutral-800 px-4 py-8 shadow-dialog flex flex-col gap-4 min-w-0">
            <h2 className="text-center text-19 font-bold leading-tight -tracking-2">
              For the streamer
            </h2>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/plex"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/plex/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Plex</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Stream Movies &amp; TV Shows
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/transmission"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/transmission/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">
                  Transmission
                </h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  A fast, easy and free BitTorrent client
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/sonarr"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/sonarr/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Sonarr</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  Smart PVR for newsgroup and bittorrent users
                </p>
              </div>
            </a>
            <a
              className="flex w-full items-center gap-2.5 rounded-15 p-2 duration-300 hover:bg-white/4"
              href="/app-store/jellyfin"
            >
              <img
                src="https://getumbrel.github.io/umbrel-apps-gallery/jellyfin/icon.svg"
                alt=""
                className="aspect-square shrink-0 bg-cover bg-center rounded-10"
                style={{ width: 50, height: 50, minWidth: 50, minHeight: 50 }}
              />
              <div className="flex min-w-0 flex-1 flex-col">
                <h3 className="text-15 font-semibold -tracking-3">Jellyfin</h3>
                <p className="w-full min-w-0 truncate text-13 opacity-50">
                  The Free Software Media System
                </p>
              </div>
            </a>
          </div>
        </FirstAppSec>
      </div>
    </>
  );
};

const FirstAppSec = styled.div`
  max-width: 1440px;
  .cardCstm {
    border-radius: 20px;
    a {
      border-radius: 15px;
      &:hover {
        background: rgb(255 255 255 / 0.04);
      }
      img {
        border-radius: 10px;
      }
    }
  }
`;

export default InstallFirstApp;
