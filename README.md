# Everest Kitchen Music Pack para Foundry VTT 14

Cada pasta final dentro de `audio/` vira uma playlist, seguindo a estrutura do [módulo original](https://github.com/IgorFmatheus/everest-kitchen-music-pack).

- `audio/musicas/urbano/` recebe músicas urbanas.
- `audio/musicas/medieval/combate/` recebe músicas de combate medieval.
- `audio/musica-ambiente/medieval/florestas/` recebe sons de floresta.
- `audio/musica-ambiente/ficcao-cientifica/` recebe ambientes de ficção científica.

Você pode criar outras categorias. Apenas `medieval` usa um nível adicional de subpastas. Use arquivos MP3, OGG, OPUS, WAV, FLAC ou WEBM. As músicas tocam em sequência. Os ambientes usam Soundboard com repetição por faixa. O Git rastreia os marcadores das pastas e ignora os áudios.

## Gerar o compêndio

Com Node.js 22.12 ou mais recente, abra o PowerShell nesta pasta:

```powershell
npm.cmd ci
npm.cmd run build:playlists
```

O segundo comando gera o banco LevelDB em `packs/musicas/`. Rode-o novamente sempre que alterar a coleção.

## Instalar no Foundry VTT 14

1. Desligue o Foundry e crie a pasta `Data/modules/everest-kitchen-music-pack-v14/` na pasta de dados do servidor.
2. Copie `module.json`, `audio/` e `packs/` para essa pasta. Em uma atualização, substitua o banco anterior pelo banco gerado completo.
3. Inicie o Foundry VTT 14 e ative **Everest Kitchen Music Pack (V14)** no mundo.
4. Abra o compêndio do módulo e importe as playlists desejadas. Depois de atualizar o módulo, importe novamente as playlists que quiser atualizar no mundo.

- [Foundry CLI oficial](https://github.com/foundryvtt/foundryvtt-cli)
- [Guia de empacotamento de módulos](https://foundryvtt.com/article/packaging-guide/)
