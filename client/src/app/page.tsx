import Image from 'next/image'
import Link from 'next/link'

import { buildPageMetadata } from '@/seo/next-metadata'

export const metadata = buildPageMetadata('home')

export default function HomePage() {
  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-16">
      <header className="flex flex-col items-center gap-5 text-center">
        <Image
          src="/codex-logo.svg"
          alt="CodeX logo"
          width={180}
          height={180}
          priority
          className="h-auto w-32 drop-shadow-lg sm:w-44"
        />

        <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
          CodeX is a team of passionate engineers and designers, unifying students, graduates, and
          other young specialists around the world interested in making high-quality open-source
          projects and getting a priceless experience of making full-valued products on a global
          market. Our goal is to make a team with fire in the eyes and idealistic tempers.
        </p>
        <Link
          href="/login"
          className="rounded-2xl bg-primary px-10 py-3 text-sm font-semibold text-primary-foreground shadow transition hover:opacity-90"
        >
          Войти в LLM UI
        </Link>
      </header>

      <section className="space-y-5 rounded-3xl border border-white/10 bg-white/5 p-6 text-base leading-relaxed shadow-inner backdrop-blur lg:p-8">
        <p>
          CodeX — небольшая команда энтузиастов, создающих продукты с открытым исходным кодом.
          Сейчас мы ищем не просто опытных, но прежде всего мотивированных людей, которые хотят
          развивать свои технические и продуктовые навыки и работать вместе с командой над
          передовыми технологиями. И которые готовы уделять достаточно времени работе в CodeX.
        </p>
        <p>
          У нас есть пробное задание, которое поможет лучше понять ваш технический уровень и
          мотивацию. Оно также позволит нам познакомиться ближе и начать вашу интеграцию в рабочий
          процесс. В ходе выполнения задания мы будем общаться и работать вместе, и вы сможете
          оценить, насколько вам интересна работа в CodeX.
        </p>
        <br />
        <hr />
        <br />
        <p>
          LLM-модели становятся всё более востребованными и интегрируются в самые разные
          технологические сферы и продукты. Мы предлагаем вам поработать на передовой — попробовать
          создать собственный интерфейс для взаимодействия с моделью. Это увлекательная задача,
          которая позволит разобраться в принципах работы интерфейсов для LLM, попрактиковаться в
          работе со стримами, парсингом Markdown, анимациями и рендерингом различных блоков.
          Надеемся, что в процессе выполнения задания вы узнаете что-то новое и получите полезный
          опыт.
        </p>
        <p>Это общее задание для Frontend и Backend разработчиков.</p>
      </section>
    </main>
  )
}
