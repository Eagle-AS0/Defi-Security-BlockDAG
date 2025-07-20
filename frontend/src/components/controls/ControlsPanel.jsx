import { useContract } from '../../context/ContractContext';

const Controls = () => {
  const { pauseContract, unpauseContract, setThreshold, connectWallet } = useContract();

  return (
    <>
      <button onClick={connectWallet}>Connect Wallet</button>
      <button onClick={pauseContract}>Pause</button>
      <button onClick={unpauseContract}>Unpause</button>
    </>
  );
};
