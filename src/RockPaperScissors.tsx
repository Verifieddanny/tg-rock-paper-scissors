import { useState } from 'react'
import { ConnectButton, TransactionButton, useActiveAccount, useActiveWallet, useDisconnect, useReadContract } from 'thirdweb/react';
import { client } from './client';
import { inAppWallet } from 'thirdweb/wallets';
import { shortenAddress } from 'thirdweb/utils';
import { getContract } from 'thirdweb';
import { sepolia } from 'thirdweb/chains';
import { claimTo, getBalance } from 'thirdweb/extensions/erc20';

type Choice = 'Rock' | 'Paper' | 'Scissors';
type Result = 'Win' | 'Lose' | 'Tie';

interface GameResult {
    playerChoice: Choice;
    computerChoice: Choice;
    Result: Result;
}

const wallets = [
  inAppWallet({
    auth: {
      options: ["email"],
    },
  }),
];

const choices: Choice[] = ['Rock', 'Paper', 'Scissors']
const getComputerChoice = (): Choice => choices[Math.floor(Math.random() * choices.length)];

const determineWinner = (playerChoice: Choice, computerChoice: Choice): Result => {
    if(playerChoice === computerChoice) return 'Tie';
    if((playerChoice === 'Rock' && computerChoice === 'Scissors') || (playerChoice === 'Paper' && computerChoice === 'Rock') || (playerChoice === 'Scissors' && computerChoice === 'Paper')){
        return 'Win';
    }
    return 'Lose';
};

function RockPaperScissors() {
    const account = useActiveAccount();

    const {disconnect} = useDisconnect();
    const wallet = useActiveWallet();
    const contract = getContract({
      client: client,
      chain: sepolia,
      address: "0x251015dbF61303060c8cDc0c4AA9bb8853629dD4",
    });
    
    const [result, setResult] = useState<GameResult | null>(null);
    const [showPrize, setShowprize] = useState<boolean>(false);
    const [showModal, setShowmodal] = useState<boolean>(false);
    const [prizeClaimed, setPriceClaimed] = useState<boolean>(false);

    const handleChoice = (playerChoice: Choice) => {
        const computerChoice = getComputerChoice();
        const gameResult = determineWinner(playerChoice, computerChoice);
        setResult({ playerChoice, computerChoice, Result: gameResult });
        setShowprize(gameResult === "Win");
    }

    const resetGame = () => {
        setShowprize(false);
        setShowmodal(false);
        setResult(null);
        setPriceClaimed(false);
    }

    const claimPrice = () => {
        setShowmodal(true);
    }

    const { data: tokenbalance } = useReadContract(getBalance, {
      contract: contract,
      address: account?.address!,
    });
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#f0f0f0",
        color: "#333",
      }}
    >
      <div
        style={{
          padding: "2rem",
          margin: "0 0.5rem",
          width: "400px",
          maxWidth: "98%",
          height: "400px",
          backgroundColor: "#ffffff",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          position: "relative",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "2rem",
            textAlign: "center",
          }}
        >
          Mini game
        </h1>
        {!account ? (
          <ConnectButton
            client={client}
            accountAbstraction={{
              chain: sepolia,
              sponsorGas: true,
            }}
            connectModal={{
              title: "Mini Game App",
              showThirdwebBranding: false,
            }}
            wallets={wallets}
          />
        ) : (
          <>
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                height: "auto",
                width: "100%",
                gap: "0.5rem",
                alignItems: "center",
                justifyContent: "space-between",
                border: "1px solid #f0f0f0",
                padding: "0.5rem",
              }}
            >
              <div>
                <p
                  style={{
                    fontSize: "0.5rem",
                    marginBottom: "-10px",
                    marginTop: "-10px",
                  }}
                >
                  {shortenAddress(account.address)}
                </p>
                <p style={{ fontSize: "0.75rem", marginBottom: "-10px" }}>
                  Balance: {tokenbalance?.displayValue}
                </p>
              </div>
              <button
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#dc3545",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontSize: "0.75rem",
                }}
                onClick={() => wallet && disconnect(wallet)}
              >
                Logout
              </button>
            </div>
            {!result ? (
              <div>
                <h3>Choose your options</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: "0.5rem",
                    margin: "2rem",
                  }}
                >
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      onClick={() => handleChoice(choice)}
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#007bff",
                        borderRadius: "4px",
                        color: "#ffffffff",
                        cursor: "pointer",
                        fontSize: "3rem",
                        outline: "none",
                        border: "none",
                      }}
                    >
                      {choice === "Rock"
                        ? "🪨"
                        : choice === "Paper"
                        ? "🧻"
                        : "✂️"}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <p style={{ fontSize: "1.5rem", marginBottom: "-10px" }}>
                  You chose: {result.playerChoice}
                </p>
                <p style={{ fontSize: "1.5rem", marginBottom: "-10px" }}>
                  You chose: {result.computerChoice}
                </p>

                <div
                  style={{
                    position: "absolute",
                    bottom: "2rem",
                    display: "flex",
                    flexDirection: "column",
                    gap: "1rem",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={resetGame}
                    style={{
                      padding: "0.5rem 1rem",
                      backgroundColor: "#28a745",
                      borderRadius: "4px",
                      color: "#ffffffff",
                      cursor: "pointer",
                      border: "none",
                    }}
                  >
                    Try again
                  </button>
                  {showPrize && !prizeClaimed && (
                    <button
                      style={{
                        padding: "0.5rem 1rem",
                        backgroundColor: "#ffc107",
                        color: "#000000",
                        cursor: "pointer",
                        border: "none",
                        borderRadius: "4px",
                      }}
                      onClick={claimPrice}
                    >
                      Claim price
                    </button>
                  )}
                  {showModal && (
                    <div
                      style={{
                        position: "fixed",
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: "rgba(0,0,0,0.5)",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <div
                        style={{
                          backgroundColor: "#ffffffff",
                          padding: "2rem",
                          borderRadius: "3px",
                          maxWidth: "300px",
                          textAlign: "center",
                        }}
                      >
                        <h2
                          style={{ fontSize: "1.2rem", marginBottom: "1rem" }}
                        >
                          Claim 10 tokens!
                        </h2>
                        <p style={{ marginBottom: "1rem" }}>
                          You won and can claim 10 tokens to your wallet.
                        </p>
                        <TransactionButton
                          transaction={() =>
                            claimTo({
                              contract: contract,
                              to: account.address,
                              quantity: "10",
                            })
                          }
                          onTransactionConfirmed={() => {
                            alert("Price claimed!");
                            setShowmodal(false);
                            setPriceClaimed(true);
                          }}
                          style={{
                            padding: "0.5rem 1rem",
                            backgroundColor: "#28a745",
                            color: "white",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Claim prize
                        </TransactionButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}



export default RockPaperScissors
