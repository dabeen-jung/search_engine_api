import express from "express";
import { KMR } from "koalanlp/API";
import { Tagger } from "koalanlp/proc";
import { Op } from "sequelize";
import sequelize from "sequelize";
import { Keyword } from "../models/Keyword";
import { Link } from "../models/Link";

const router = express.Router();

//검색 순위 별로 정렬을 위해
type FrequentLink = {
  url: string;
  content: string; //description
  count: number; //중복갯수
};

//get요청
// ':'으로 시작하는 것은 path Varaible
router.get("/", async (req, res) => {
  const { q } = req.query;
  if (!q) {
    return res.status(400).json();
  }

  //단일값을 만들고 싶을떄는 Set, 대표값을 이용하고 싶으면 map
  const tagger = new Tagger(KMR);
  const tagged = await tagger(q);
  const searchKeywords: Set<string> = new Set(); //중복확인

  //형태소 분석기
  for (const sent of tagged) {
    for (const word of sent._items) {
      for (const morpheme of word._items) {
        if (
          morpheme._tag === "NNG" ||
          morpheme._tag === "NNP" ||
          morpheme._tag === "NNB" ||
          morpheme._tag === "NP" ||
          morpheme._tag === "NR" ||
          morpheme._tag === "VV" ||
          morpheme._tag === "SL"
        ) {
          // 조건에 맞는지(존재하면), 중복확인을 통해 작성하기
          const keyword = morpheme._surface.toLowerCase();
          searchKeywords.add(keyword);
        }
      }
    }
  }

  //형태소 분석한 것을 가지고 배열로 바꿔줌
  const arr = Array.from(searchKeywords.values());
  /*
  //해당 모델의 column만 in을 쓸 수 있음
  //Keyword 에서 특정 키워드가 포함된 링크를 전달 받음
  const keywords = await Keyword.findAll({
    where: {
      name: {
        [Op.in]: arr,
      },
    },
    include: [Link], //함께 불러올 모델
  });

  

  //중복 제거를 위해
  const frequentLink = new Map<string, FrequentLink>();

  keywords.forEach((keyword) => {
    keyword.links.forEach((link) => {
      //get은 값이 없으면 undefined 점을 이용
      const exist = frequentLink.get(link.url);

      if (exist) {
        //있으면 count 올리기
        exist.count = exist.count + 1;
      } else {
        //그 밖에는 없으니 아예 추가해줘야 함
        frequentLink.set(link.url, {
          url: link.url,
          content: link.description,
          count: 1,
        });
      }
    });
  });

  //저장되어 있는 값들의 목록을 뽑아 정렬
  const result = Array.from(frequentLink.values()).sort(
    (link1, link2) => link2.count - link1.count
  );

  //return res.status(200).json(result);

 

  */

  const links = await Link.findAll({
    include: [
      {
        model: Keyword,
        where: {
          name: {
            [Op.in]: Array.from(searchKeywords.values()),
          },
        },
        attributes: [],
        through: {
          attributes: [],
        },
      },
    ],
    attributes: [
      "url",
      [sequelize.fn("count", sequelize.col("Link.url")), "total"],
    ],
    group: ["Link.id"],
  });

  return res.status(200).json(links);
});

export default router;
