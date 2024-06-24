import Fastify from "fastify";
import fs from "node:fs";
import st from "node:stream";
import utils from "node:util";
import path from "node:path";
import { randomUUID } from "node:crypto";
const pipeline = utils.promisify(st.pipeline);

const fastify = Fastify.fastify({ logger: true });

fastify.register(function (f, opts, done) {
  f.addContentTypeParser("*", function (request, payload, done) {
    done(null);
  });

  f.get("/", function (req, reply) {
    reply.send({ health: "check" });
  });

  f.post(
    "/upload",
    {
      schema: {
        headers: {
          type: "object",
          properties: {
            "Content-Type": { type: "string" },
          },
          required: ["Content-Type"],
        },
      },
    },
    async (req, reply) => {
      const headers = req.headers;

      const ext = {
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
          "xlsx",
        "application/vnd.ms-excel": "xls",
        "image/jpeg": "jpg",
      }[headers["content-type"] as string];

      console.log("incoming file extension === ", ext);

      if (!ext) {
        reply.code(400);

        reply.send({ status: "file extention not supported" });
        return;
      }

      const fileStream = req.raw;

      const fileName = `${headers["x-file-name"]}` ?? Date.now();

      const assetFolder = path.resolve(process.cwd(), "tmp", randomUUID());

      if (!fs.existsSync(assetFolder)) {
        console.log("exists===", fs.existsSync(assetFolder));
        fs.mkdirSync(assetFolder, { recursive: true });
      }

      const assetPath = path.resolve(assetFolder, `${fileName}.${ext}`);

      const headersPath = path.resolve(assetFolder, `header.json`);

      await pipeline(fileStream, fs.createWriteStream(assetPath));

      fs.writeFileSync(headersPath, JSON.stringify(headers));

      reply.send({ status: "File uploaded successfully" });
    }
  );

  done();
});

async function bootstrap() {
  try {
    await fastify.listen({ port: 3000, host: "0.0.0.0" });
    fastify.log.info(`Server listening on ${3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

bootstrap();
