<script setup>
definePageMeta({
  title: "Crypto Tax Labs :: Home",
});

const router = useRouter();

const onButtonCLick = async () => {
  // For internal navigation
  // navigateTo("/dashboard");

  // For external navigation
  // window.location = "https://google.com";

  // TO sign in page
  const { signIn } = useMSAuth();
  await signIn();
};
</script>

<template>
  <app-header />
  <section class="text-gray-600 body-font bg-base-400 lg:h-[325px]">
    <div
      class="container mx-auto flex px-5 py-8 md:py-5 md:flex-row flex-col items-center"
    >
      <div
        class="lg:flex-grow md:w-1/2 lg:pr-24 md:pr-16 flex flex-col md:items-start md:text-left mb-4 md:mb-0 items-center text-center"
      >
        <h1
          class="title-font sm:text-4xl text-3xl mb-4 font-medium text-white dark:text-gray-800"
        >
          In the ever-evolving world of cryptocurrency
        </h1>
        <p class="mb-8 leading-relaxed text-white dark:text-gray-800">
          staying compliant with tax laws can be a daunting task. Our Crypto Tax
          Calculator is here to transform complexity into simplicity. With just
          a few clicks, effortlessly track your transactions, calculate your tax
          obligations, and generate comprehensive reports tailored to your
          country’s tax requirements.
        </p>
      </div>
      <div class="lg:max-w-96 md:w-1/2 w-5/6 relative">
        <div
          class="bg-white dark:bg-gray-800 dark:border-black border rounded-lg px-6 py-8 md:px-8 md:py-16 flex flex-col md:ml-auto w-full relative z-10 shadow-xl text-center md:text-left"
        >
          <h2
            class="text-gray-900 dark:text-white text-opacity-90 text-lg mb-5 font-medium title-font"
          >
            Ready to Take the Hassle Out of Crypto Taxes?
          </h2>
          <button
            class="text-white bg-base-400 border-0 py-2 px-6 focus:outline-none hover:bg-base-600 rounded text-lg"
            @click="onButtonCLick"
          >
            Start Simplifying Now
          </button>
          <p class="text-xs text-gray-500 dark:text-white text-opacity-90 mt-3">
            Dive into a World of Tax Simplicity.
          </p>
        </div>
      </div>
    </div>
  </section>
  <exchange-list />
  <app-footer />
</template>
