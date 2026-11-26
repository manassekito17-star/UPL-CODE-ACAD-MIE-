# `engine/history`

Historique Annuler / Rétablir d'un document (module M2). Les opérations du
moteur sont pures et renvoient un nouveau document : chaque état de
l'historique est ce document, avec un libellé. Les calques inchangés sont
partagés entre états et les images sont des références de fichiers, jamais
copiées. 50 états par document (`HISTORY_LIMIT`).
