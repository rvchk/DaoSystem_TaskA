gnome-terminal -- bash -c "cd web/my-app && npm run dev; exec bash"
xdg-open http://localhost:5173
/home/user/Загрузки/Task_A_2025/web/my-app/src
cd myGeth
./geth --datadir data --dev --http --http.api "eth,net,web3" --http.port 8545 --http.corsdomain "*" --networkid 1337