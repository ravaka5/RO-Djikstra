import Flow from './assets/flow/graph';

const App = () => {
  return (
    <>
      <div style={styles.flowContainer}>
        <Flow />
      </div>
    </>
  );
};

const styles = {
  flowContainer: {
    width: '100%',
    height: '400px',
    border: '1px solid #ccc'
  }
};

export default App;

