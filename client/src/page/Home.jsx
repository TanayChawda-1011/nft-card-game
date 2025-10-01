import React from "react";

import PageHOC from "../components/PageHOC";

const Home = () => {
  return <div></div>;
};

export default PageHOC(
  Home,
  <>
    Welcome to Avax Gods <br /> A Web3 NFT Card Game
  </>,
  <>
    Connect your Wallet to start playing <br /> The Ultimate Web3 Battle Card
    Game
  </>
);
