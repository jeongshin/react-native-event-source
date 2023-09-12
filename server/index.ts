import bodyParser from 'body-parser';
import express from 'express';
import { concatMap, delay, from, of } from 'rxjs';
import cors from 'cors';

const app = express();

app.listen(3000, () => {
  console.log('start listening');
});

app.use(bodyParser.json());

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));

const messages = [
  '안녕',
  '하',
  '세요',
  '만나서',
  '반갑',
  '습니다',
  'ㅋㅋ',
  '이건',
  '테스트를 위한',
  '값',
  '입니다',
];

const headers = {
  'Content-Type': 'text/event-stream; charset=utf-8',
  'Connection': 'keep-alive',
  'Cache-Control': 'no-cache',
};

app.get('/stream', (req, res) => {
  res.writeHead(201, headers);

  from(messages)
    .pipe(concatMap((x) => of(x).pipe(delay(500))))
    .subscribe((message) => {
      res.write(`data: ${JSON.stringify({ message })}\n\n`);

      if (messages.findIndex((x) => x === message) === messages.length - 1) {
        res.write(`data: ${JSON.stringify({ end: '[DONE]' })}\n\n`);
      }
    });

  req.on('close', () => {
    console.log('closed connection from client');
  });
});

// TODO: mock error case
// app.get('/stream/error', (req, res) => {
//   res.writeHead(201, headers);

//   from(messages)
//     .pipe(concatMap((x) => of(x).pipe(delay(500))))
//     .subscribe((message) => {

//     });

//   req.on('close', () => {
//     console.log('closed connection from client');
//   });
// });

export default app;
