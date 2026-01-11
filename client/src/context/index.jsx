import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import Web3Modal from "web3modal";
import { useNavigate } from "react-router-dom";

import { ABI, ADDRESS } from "../contract";
import { createEventListeners } from "./createEventListeners";

const GlobalContext = createContext();

export const GlobalContextProvider = ({ children }) => {
  const [walletAddress, setWalletAddress] = useState("");
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [showAlert, setShowAlert] = useState({
    status: false,
    type: "info",
    message: "",
  });
  const [battleName, setBattleName] = useState("");
  const [gameData, setGameData] = useState({
    players: [],
    pendingBattles: [],
    activeBattle: null,
  });
  const [updateGameData, setUpdateGameData] = useState(0);
  const [battleGround, setBattleGround] = useState("bg-astral");

  const navigate = useNavigate();

  // ✅ SINGLE source of truth: Web3Modal
  useEffect(() => {
    const connectWallet = async () => {
      try {
        const web3Modal = new Web3Modal({
          cacheProvider: true,
        });

        const connection = await web3Modal.connect();
        const newProvider = new ethers.providers.Web3Provider(connection);
        const signer = newProvider.getSigner();
        const address = await signer.getAddress();

        const newContract = new ethers.Contract(ADDRESS, ABI, signer);

        setProvider(newProvider);
        setWalletAddress(address);
        setContract(newContract);

        console.log("✅ Wallet connected:", address);
        console.log("✅ Contract ready:", newContract);
      } catch (error) {
        console.log("❌ Wallet connection failed:", error.message);
      }
    };

    connectWallet();
  }, []);

  // Event listeners
  useEffect(() => {
    if (contract) {
      createEventListeners({
        navigate,
        contract,
        provider,
        walletAddress,
        setShowAlert,
        setUpdateGameData,
      });
    }
  }, [contract]);

  //* Set the game data to the state
  useEffect(() => {
    const fetchGameData = async () => {
      if (contract) {
        const fetchedBattles = await contract.getAllBattles();
        const pendingBattles = fetchedBattles.filter(
          (battle) => battle.battleStatus === 0
        );
        let activeBattle = null;

        fetchedBattles.forEach((battle) => {
          if (
            battle.players.find(
              (player) => player.toLowerCase() === walletAddress.toLowerCase()
            )
          ) {
            if (battle.winner.startsWith("0x00")) {
              activeBattle = battle;
            }
          }
        });

        setGameData({ pendingBattles: pendingBattles.slice(1), activeBattle });
        console.log({ fetchedBattles });
      }
    };

    fetchGameData();
  }, [contract, updateGameData]);

  // Alerts (tutorial-compatible)
  useEffect(() => {
    if (showAlert?.status) {
      const timer = setTimeout(() => {
        setShowAlert({ status: false, type: "info", message: "" });
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  return (
    <GlobalContext.Provider
      value={{
        contract,
        walletAddress,
        provider,
        showAlert,
        setShowAlert,
        battleName,
        setBattleName,
        gameData,
        battleGround,
        setBattleGround,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => useContext(GlobalContext);
