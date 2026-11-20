// Project Structure & File Literacy (프로젝트 구조와 파일 이해).
// A course track in the same shape as Robotics Engineering: modules, lessons,
// and stages. Each lesson answers the six questions in helpers.js.
import { MODULE_01, MODULE_02 } from './modules-1-2.js';
import { MODULE_03, MODULE_04 } from './modules-3-4.js';
import { MODULE_05, MODULE_06 } from './modules-5-6.js';
import { MODULE_07 } from './modules-7.js';

export const PROJECT_STRUCTURE = {
  id: 'project-structure',
  title: 'Project Structure & File Literacy',
  titleKo: '프로젝트 구조와 파일 이해',
  tagline: '낯선 프로젝트를 열어도 길을 잃지 않는 법',
  level: 'Beginner to intermediate',
  description:
    '소프트웨어 프로젝트는 왜 이런 폴더와 파일로 나뉘어 있는지, 각 이름이 무엇을 뜻하는지, 그리고 여러 부분이 어떻게 함께 동작하는지 배웁니다. 이 course를 마치면 처음 보는 Spring Boot 프로젝트를 열고 구조를 읽어, 각 파일의 책임과 요청의 흐름을 설명할 수 있습니다.',
  prerequisites: [
    '컴퓨터에서 파일과 폴더를 만들고 열 수 있어야 합니다.',
    '프로그래밍 경험은 필요하지 않습니다. 코드는 읽는 방법부터 차근차근 봅니다.',
    '7번 모듈은 GitHub 계정과 Git 설치가 있으면 가장 좋습니다.',
  ],
  outcomes: [
    '처음 보는 프로젝트의 폴더 구조를 읽고, 각 폴더의 역할을 설명할 수 있다.',
    '확장자와 경로만 보고 파일이 무엇을 위한 것인지 짐작하고 확인할 수 있다.',
    '설정 파일, 환경 변수, 개발과 운영 설정을 구분할 수 있다.',
    'Controller, Service, Repository, Entity, DTO의 역할과 연결을 설명할 수 있다.',
    '브라우저의 요청이 백엔드를 거쳐 화면으로 돌아오는 길을 따라갈 수 있다.',
    '실제 저장소를 읽고 프로젝트 구조 지도를 그릴 수 있다.',
  ],
  stages: [
    { id: 'anatomy', label: 'Foundations · 기초', modules: ['anatomy', 'folder-roles', 'file-types'] },
    { id: 'config', label: 'Configuration · 설정', modules: ['configuration'] },
    { id: 'architecture', label: 'Architecture · 구조', modules: ['backend', 'frontend'] },
    { id: 'lab', label: 'Practice · 실습', modules: ['reading-lab'] },
  ],
  modules: [MODULE_01, MODULE_02, MODULE_03, MODULE_04, MODULE_05, MODULE_06, MODULE_07],
};
