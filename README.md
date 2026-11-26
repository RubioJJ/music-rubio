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

## Publicar no GitHub

Crie branches a partir da `main` atualizada, usando o prefixo `feature/`. Envie a branch à `origin` e abra um pull request para `main`. O GitHub Actions valida o nome da branch e compila o módulo no pull request. Configure a proteção da `main` para exigir pull request e o check **Validar módulo e branch**.

Cada atualização da `main` publica uma versão `1.0.N`, com manifesto e ZIP. No Foundry, use o endereço `https://github.com/USUARIO/REPOSITORIO/releases/latest/download/module.json` em **Install Module → Manifest URL**. O Foundry precisa acessar os arquivos da release sem login.

A release contém as faixas versionadas no Git. Os arquivos de áudio adicionados apenas na cópia local ficam fora das releases. Para incluir arquivos que você pode distribuir, adicione-os explicitamente com `git add -f -- <arquivo>` na branch `feature/`. Configure o Git LFS antes de adicionar faixas grandes.

- [Foundry CLI oficial](https://github.com/foundryvtt/foundryvtt-cli)
- [Guia de empacotamento de módulos](https://foundryvtt.com/article/packaging-guide/)
